// app.js — orchestration. Boots the brain, wires events, routes commands, drives proactivity.
import * as store from './store.js';
import { S, state, activeSpace, idbPut, uid, now, loadChat, saveChatTurn } from './store.js';
import { pushUser, pushAxon, pushSys, setState, touch, idleMs } from './dom.js';
import { speak, stopSpeak, initSTT, convoMode } from './voice.js';
import * as ai from './ai.js';
import * as ui from './ui.js';
import { probeBridge, bridgeOnline, bridgeInfo, setConfirmer } from './bridge.js';

function reply(text){ const h = pushAxon(text); h.finalize(text); speak(text); }
function greet(){ const h=new Date().getHours(); return h<5?'Still awake':h<12?'Good morning':h<17?'Good afternoon':h<22?'Good evening':'Late night'; }

// expose handlers used by inline onclick in the drawers
window.AX = {
  openDrawer:ui.openDrawer, closeDrawer:ui.closeDrawer, enterSpace:ui.enterSpace, addSpace:ui.addSpace,
  addEntry:ui.addEntry, delEntry:ui.delEntry, addMaterial:ui.addMaterial, addMem:ui.addMem, delMem:ui.delMem,
  saveSettings:ui.saveSettings, saveProfile:ui.saveProfile, exportAll:ui.exportAll, importAll:ui.importAll, wipe:ui.wipe
};

ui.setReply(reply);
ui.setOnSpaceChange(loadActiveChat);

// "save this reply to the current space" action under each AXON answer
ai.setSaveActionFactory((el, text)=>{
  const row = document.createElement('div'); row.className = 'msg-acts';
  const sp = activeSpace();
  const btn = document.createElement('button'); btn.className='gbtn'; btn.textContent='Save to '+(sp?sp.name:'space');
  btn.addEventListener('click', async ()=>{
    const e={ id:uid(), spaceId:S.activeSpace, title:text.split(/[.\n]/)[0].slice(0,60), body:text, tags:['saved'], attachments:[], createdAt:now(), updatedAt:now() };
    await idbPut('entries',e); state.entries.push(e); btn.textContent='Saved'; btn.disabled=true;
  });
  row.appendChild(btn); el.appendChild(row);
});

async function loadActiveChat(){
  const turns = await loadChat(S.activeSpace);
  ai.setHistory(turns.map(t=>({ role:t.role, content:t.content })));
  const log = document.getElementById('log'); log.innerHTML='';
  document.body.classList.toggle('chatting', turns.length>0);
  for(const t of turns.slice(-10)){
    if(t.role==='user') pushUser(t.content);
    else pushAxon('', '').finalize(t.content);
  }
}

function offlineReply(){
  const m = "No brain is on, but I am far from useless. I can do math, convert units, work with dates, answer common facts, take notes, remember things, and recall anything you have saved. For open-ended reasoning, pick a brain in Settings: Claude online, or a free local model that runs offline.";
  const h = pushAxon(m); h.finalize(m); speak(m);
}

async function route(raw){
  const t = raw.toLowerCase().trim();
  if(/^(help|what can you do|commands|who are you)/.test(t)) return reply("I am AXON. Talk to me about anything and I draw on what you have taught me. Even with no brain on, I handle math, unit conversions, dates, and common facts instantly and offline. Teach me with 'remember that'. Save things with 'note'. Feed me files in any space. I can draw charts, diagrams, and flashcards. Say 'summarize this' to turn our talk into a saved note. 'Spaces', 'memory', and 'settings' open those panels.");
  if(/^(status|briefing|brief|how am i|where am i|sitrep|what'?s on deck|whats on deck)/.test(t)) return reply(briefing());
  let m = raw.match(/^(remember(?: that)?|note to self|keep in mind)[:,]?\s+(.+)/i);
  if(m){ const text=m[2].trim(); const mem={id:uid(),text,createdAt:now(),source:'told'}; await idbPut('memories',mem); state.memories.push(mem); return reply(`Got it. I will remember that ${text}`); }
  m = raw.match(/^(note|log|save|jot)[:,]?\s+(.+)/i);
  if(m){ const body=m[2].trim(); const sp=activeSpace(); const e={id:uid(),spaceId:sp.id,title:body.split(/[.\n]/)[0].slice(0,60),body,tags:[],attachments:[],createdAt:now(),updatedAt:now()}; await idbPut('entries',e); state.entries.push(e); return reply(`Saved to ${sp.name}. I will surface it when it is relevant.`); }
  if(/^(summari[sz]e|sum up|wrap up)( this| our| the)?( chat| conversation| talk)?/.test(t)){
    if(ai.history.length<2) return reply("Not much to summarize yet.");
    reply("Summarizing and saving...");
    try{ const sum=await ai.summarizeConversation(); const sp=activeSpace(); const e={id:uid(),spaceId:sp.id,title:'Summary '+new Date().toLocaleDateString(),body:sum,tags:['summary'],attachments:[],createdAt:now(),updatedAt:now()}; await idbPut('entries',e); state.entries.push(e); reply(`Saved a summary to ${sp.name}.`); }
    catch(e){ reply("Could not summarize that. Turn a brain on first."); }
    return;
  }
  m = raw.match(/^(switch to|go to|open|focus on)\s+(.+)/i);
  if(m){ const name=m[2].trim().replace(/\bspace\b/i,'').trim();
    const sp=state.spaces.find(s=>s.name.toLowerCase()===name.toLowerCase()) || state.spaces.find(s=>s.name.toLowerCase().startsWith(name.toLowerCase()));
    if(sp){ S.activeSpace=sp.id; store.saveS(); ui.updateSpacePill(); await loadActiveChat(); return reply(`Switched to ${sp.name}.`); }
    if(/setting/.test(name)) return ui.openDrawer('settings');
    if(/memor/.test(name)) return ui.openDrawer('memory');
    if(/space/.test(name)) return ui.openDrawer('spaces');
    return reply(`I do not have a space called ${name}. Open Spaces to create it.`);
  }
  if(/^(spaces?|my spaces)$/.test(t)) return ui.openDrawer('spaces');
  if(/^memor(y|ies)$/.test(t)) return ui.openDrawer('memory');
  if(/^(settings?|config)$/.test(t)) return ui.openDrawer('settings');
  if(/^(close|hide|dismiss)$/.test(t)){ ui.closeDrawer(); return; }
  if(/^(stop|quiet|shut up|silence)$/.test(t)){ stopSpeak(); ai.stopGeneration(); return; }
  if(/what do you (know|remember) about me|what have i told you/.test(t)){
    if(!state.memories.length) return reply("Nothing yet. Teach me with 'remember that' and it sticks.");
    return reply(`I am holding ${state.memories.length} things you have told me. Recent: ${state.memories.slice(-3).map(x=>x.text).join('; ')}. Open Memory to see them all.`);
  }
  return ai.ask(raw, offlineReply);
}

function briefing(){
  const sp = activeSpace();
  let s = `${greet()}, Danial. You are in ${sp?sp.name:'General'}. ${state.entries.length} notes across ${state.spaces.length} spaces, ${state.memories.length} memories. `;
  const eng = S.engine==='api'&&S.apiKey?'Claude is online':S.engine==='local'?'the local brain is ready':'reasoning is off, instant answers still work';
  s += `Right now ${eng}. `;
  s += S.engine==='off' ? 'Math, units, dates, and recall run offline. Switch a brain on in Settings for everything else.' : 'Ask me anything, or say summarize this to save our talk.';
  return s;
}

function submit(){ const i=document.getElementById('cmd'); const text=i.value.trim(); if(!text) return; i.value=''; stopSpeak(); pushUser(text); route(text); }

// confirm card for any action that touches the machine
const ACTION_TITLE = { write:'Write a file', exec:'Run a command', run_code:'Execute code', open:'Open on your machine' };
function describeAction(name, args){
  if(name==='write') return { sub:args.path, body:(args.content||'').slice(0,600) };
  if(name==='exec') return { sub:args.cwd||'', body:args.cmd };
  if(name==='run_code') return { sub:(args.lang||'python')+' snippet', body:args.code };
  if(name==='open') return { sub:'', body:args.target };
  return { sub:'', body:JSON.stringify(args) };
}
function confirmAction(name, args){
  return new Promise(resolve=>{
    const d = describeAction(name, args);
    const wrap = document.createElement('div'); wrap.className='confirm-scrim';
    wrap.innerHTML = `<div class="confirm-card">
      <div class="confirm-h">AXON wants to: ${ACTION_TITLE[name]||name}</div>
      ${d.sub?`<div class="confirm-sub">${d.sub.replace(/[<>]/g,'')}</div>`:''}
      <pre class="confirm-body">${(d.body||'').replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</pre>
      <div class="confirm-btns">
        <button class="gbtn" data-no>Deny</button>
        <button class="gbtn go" data-yes>Approve</button>
      </div></div>`;
    document.body.appendChild(wrap);
    const done = v=>{ wrap.remove(); resolve(v); };
    wrap.querySelector('[data-yes]').onclick = ()=>done(true);
    wrap.querySelector('[data-no]').onclick = ()=>done(false);
    wrap.addEventListener('click', e=>{ if(e.target===wrap) done(false); });
    wrap.querySelector('[data-yes]').focus();
  });
}
setConfirmer(confirmAction);

function updateBridgeChip(){
  const chip = document.getElementById('bridgeChip'); if(!chip) return;
  const on = bridgeOnline();
  chip.classList.toggle('on', on);
  chip.querySelector('.btxt').textContent = on ? 'machine linked' : 'no bridge';
  chip.title = on ? `Connected to your computer (${bridgeInfo().os}). AXON can act on files and apps with your approval.` : 'Launch with start-axon to give AXON hands on your machine.';
}

/* ambient particle field behind the orb */
function startParticles(){
  const cv = document.getElementById('field'); if(!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, pts = [];
  function size(){ W = cv.width = innerWidth; H = cv.height = innerHeight;
    pts = Array.from({length: Math.min(90, W/14)}, ()=>({ x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.18, vy:(Math.random()-.5)*.18, r:Math.random()*1.4+.3 }));
  }
  size(); addEventListener('resize', size);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  (function frame(){
    ctx.clearRect(0,0,W,H);
    const hot = document.body.classList.contains('thinking') || document.body.classList.contains('speaking');
    for(const p of pts){
      p.x += p.vx*(hot?2.4:1); p.y += p.vy*(hot?2.4:1);
      if(p.x<0) p.x=W; if(p.x>W) p.x=0; if(p.y<0) p.y=H; if(p.y>H) p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7);
      ctx.fillStyle = hot ? 'rgba(94,230,216,.35)' : 'rgba(94,230,216,.16)';
      ctx.fill();
    }
    if(!reduced) requestAnimationFrame(frame);
  })();
}

async function boot(){
  await store.init();
  ui.updateBadges(); ui.updateSpacePill();
  startParticles();
  await probeBridge(); updateBridgeChip();
  setInterval(async ()=>{ await probeBridge(); updateBridgeChip(); }, 15000);
  document.getElementById('send').addEventListener('click', submit);
  document.getElementById('cmd').addEventListener('keydown', e=>{ if(e.key==='Enter') submit(); });
  document.getElementById('spacePill').addEventListener('click', ()=>ui.openDrawer('spaces'));
  document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click', ()=>ui.openDrawer(b.dataset.nav)));
  document.getElementById('scrim').addEventListener('click', ui.closeDrawer);
  document.getElementById('stopBtn').addEventListener('click', ()=>{ ai.stopGeneration(); stopSpeak(); });
  document.querySelectorAll('.chip-sug').forEach(c=>c.addEventListener('click', ()=>{ const i=document.getElementById('cmd'); i.value=c.dataset.q; submit(); }));
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){ ui.closeDrawer(); ai.stopGeneration(); stopSpeak(); }
    if((e.metaKey||e.ctrlKey) && e.key==='k'){ e.preventDefault(); document.getElementById('cmd').focus(); }
  });
  initSTT(t=>{ document.getElementById('cmd').value=t; submit(); }, document.getElementById('mic'), pushSys, document.getElementById('convo'));

  const steps=['initializing','loading your brain','recalling memory','online']; let i=0;
  const bt=document.getElementById('bootText');
  const iv=setInterval(()=>{ i++; if(i<steps.length) bt.textContent=steps[i]; if(i>=steps.length-1) clearInterval(iv); }, 420);

  await loadActiveChat();

  setTimeout(()=>{
    document.getElementById('veil').classList.add('gone');
    if(ai.history.length){
      const g = `${greet()}, Danial. Picking up where we left off in ${activeSpace()?.name||'General'}. ${proactiveLine()}`;
      const h=pushAxon(g); h.finalize(g); speak(g);
    } else {
      let g = `${greet()}, Danial. AXON online. `;
      g += state.memories.length ? `I am holding ${state.memories.length} things about you and ${state.entries.length} notes. ` : `Fresh brain. Teach me with 'remember that' and I will build a picture. `;
      g += proactiveLine();
      const h=pushAxon(g); h.finalize(g); speak(g);
    }
    document.getElementById('cmd').focus();
  }, 1700);

  // gentle proactivity: one nudge if you sit idle a while with a brain on
  let nudged=false;
  setInterval(()=>{
    if(nudged) return;
    if(idleMs() > 1000*60*8 && S.engine!=='off' && !convoMode){ nudged=true; const m=proactiveLine(true); if(m){ const h=pushAxon(m); h.finalize(m); speak(m); } }
  }, 60000);
}

function proactiveLine(idle){
  const sp = activeSpace();
  const inSpace = state.entries.filter(e=>e.spaceId===sp?.id).length;
  if(S.engine==='off') return idle?'' : "Pick a brain in Settings, or just ask me math, conversions, and dates anytime.";
  if(!state.entries.length) return idle?'' : "Feed me some material in a space and I will start grounding my answers in your own sources.";
  if(idle) return `Still here when you need me. ${inSpace} notes in ${sp.name} if you want to review or be quizzed.`;
  return "What are we working on?";
}

window.addEventListener('load', ()=>setTimeout(boot, 200));
