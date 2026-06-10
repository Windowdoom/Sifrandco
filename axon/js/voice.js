// voice.js — talking out (streaming, sentence-by-sentence) and listening in.
// Adds hands-free conversation mode: AXON re-opens the mic after it finishes speaking.
import { S } from './store.js';
import { setState } from './dom.js';
import { sListen } from './sound.js';

let voices = [];
function loadVoices(){ voices = (('speechSynthesis' in window) ? speechSynthesis.getVoices() : []) || []; }
if('speechSynthesis' in window){ loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
export function listVoices(){ if(!voices.length) loadVoices(); return voices.filter(v=>/en/i.test(v.lang)); }

function pickVoice(){
  if(!voices.length) loadVoices();
  if(S.voiceURI){ const m = voices.find(v=>v.voiceURI===S.voiceURI); if(m) return m; }
  const en = voices.filter(v=>/en/i.test(v.lang));
  const score = v=>{
    let s = 0; const n = (v.name||'').toLowerCase();
    if(/enhanced|premium|natural|neural/.test(n)) s += 5;
    if(/siri/.test(n)) s += 5;
    if(/ava|serena|samantha|allison|zoe|nathan|evan|tom|daniel|arthur|jamie|karen|moira|fiona|kate|oliver/.test(n)) s += 2;
    if(/google/.test(n)) s += 1;
    if(/^en-GB/i.test(v.lang)) s += 1;
    if(/^en-US/i.test(v.lang)) s += 1;
    if(v.localService) s += 1;
    return s;
  };
  return en.slice().sort((a,b)=>score(b)-score(a))[0] || voices[0] || null;
}
function applyVoice(u){ const v = pickVoice(); if(v) u.voice = v; u.rate = 1.02; u.pitch = 1.0; }

let utterCount = 0;
export function speakingActive(){ return utterCount > 0; }
let onAllSpeechDone = null;
export function setOnSpeechDone(fn){ onAllSpeechDone = fn; }

// strip markdown, urls, emphasis and symbols so speech sounds human
function cleanForSpeech(s){
  return (s||'')
    .replace(/https?:\/\/\S+/g,'')
    .replace(/\[([^\]]+)\]\([^)]*\)/g,'$1')
    .replace(/^#{1,6}\s+/gm,'')
    .replace(/^\s*[-*•]\s+/gm,'')
    .replace(/^\s*\d+\.\s+/gm,'')
    .replace(/\|/g,', ')
    .replace(/[*#`>_~]/g,'')
    .replace(/[—–]/g,', ')
    .replace(/\s+/g,' ').trim();
}
function enqueue(text){
  const t = cleanForSpeech(text);
  if(!S.speak || !('speechSynthesis' in window) || !t) return;
  const u = new SpeechSynthesisUtterance(t);
  applyVoice(u);
  const done = ()=>{ utterCount = Math.max(0, utterCount-1); if(utterCount===0){ setState(null); onAllSpeechDone && onAllSpeechDone(); } };
  u.onstart = ()=>{ utterCount++; setState('speaking'); };
  u.onend = done; u.onerror = done;
  speechSynthesis.speak(u);
}
function lastBoundary(s){ const m = s.match(/^[\s\S]*[.!?\n](\s|$)/); return m ? m[0].length : 0; }

// A streaming speaker: feed it deltas, it speaks complete sentences as they arrive,
// skipping fenced code/chart/diagram blocks. flush() speaks any remainder.
export function makeSpeaker(){
  let buf = '', fence = false;
  function run(final){
    while(true){
      if(!fence){
        const fi = buf.indexOf('```');
        if(fi === -1){
          const lb = lastBoundary(buf);
          if(lb > 0){ enqueue(buf.slice(0, lb)); buf = buf.slice(lb); continue; }
          break;
        }
        const pre = buf.slice(0, fi);
        if(pre.trim()) enqueue(pre);
        fence = true; buf = buf.slice(fi + 3); continue;
      } else {
        const ci = buf.indexOf('```');
        if(ci !== -1){ fence = false; buf = buf.slice(ci + 3); continue; }
        buf = ''; break;
      }
    }
    if(final && !fence && buf.trim()){ enqueue(buf); buf = ''; }
  }
  return { feed(d){ buf += d; run(false); }, flush(){ run(true); } };
}

export function speak(text){ const s = makeSpeaker(); s.feed(text); s.flush(); }
export function stopSpeak(){ if('speechSynthesis' in window) speechSynthesis.cancel(); utterCount = 0; if(document.body.classList.contains('speaking')) setState(null); }

export const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, listening = false;
export let convoMode = false;
let convoBtnRef = null;

export function isListening(){ return listening; }
export function startListening(){ if(rec && !listening){ stopSpeak(); try{ rec.start(); }catch(e){} } }
export function stopListening(){ if(rec && listening) rec.stop(); }
export function toggleConvoMode(){
  convoMode = !convoMode;
  convoBtnRef?.classList.toggle('live', convoMode);
  if(convoMode) startListening(); else stopListening();
  return convoMode;
}

export function initSTT(onFinal, micBtn, onNote, convoBtn){
  convoBtnRef = convoBtn;
  if(!SR){
    micBtn.title = 'Voice input needs Chrome, Edge, or Safari';
    const note = ()=>onNote && onNote('Voice input needs Chrome, Edge, or Safari. You can still type and I will talk back.');
    micBtn.addEventListener('click', note);
    convoBtn?.addEventListener('click', note);
    return false;
  }
  rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = false;
  rec.onstart = ()=>{ listening = true; micBtn.classList.add('live'); setState('listening'); sListen(); };
  rec.onend = ()=>{ listening = false; micBtn.classList.remove('live'); if(!document.body.classList.contains('thinking') && !document.body.classList.contains('speaking')) setState(null); };
  rec.onerror = e=>{
    listening = false; micBtn.classList.remove('live'); setState(null);
    if(e.error==='not-allowed'){ convoMode = false; convoBtnRef?.classList.remove('live'); onNote && onNote('Microphone blocked. Allow mic access to use voice.'); }
  };
  rec.onresult = e=>{ let t=''; for(let i=0;i<e.results.length;i++) t += e.results[i][0].transcript; const inp=document.getElementById('cmd'); if(inp) inp.value=t; if(e.results[e.results.length-1].isFinal) onFinal(t); };
  micBtn.addEventListener('click', ()=>{ stopSpeak(); if(listening) rec.stop(); else try{ rec.start(); }catch(e){} });
  convoBtn?.addEventListener('click', toggleConvoMode);
  // hands-free loop: when AXON stops talking in conversation mode, listen again
  setOnSpeechDone(()=>{ if(convoMode && !listening) setTimeout(()=>{ if(convoMode && !listening && !document.body.classList.contains('thinking')) startListening(); }, 350); });
  return true;
}
