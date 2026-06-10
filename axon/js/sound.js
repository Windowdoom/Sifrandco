// sound.js — synthesized UI sound design. No audio files; everything is generated
// with the Web Audio API so the whole thing stays self-contained and offline.
// Subtle, glassy, futuristic cues. Honors the user's sound toggle.
import { S } from './store.js';

let ctx = null;
function ac(){
  if(ctx) return ctx;
  try{ ctx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ ctx = null; }
  return ctx;
}
// browsers suspend audio until a gesture; resume on first interaction
export function unlockAudio(){ const c = ac(); if(c && c.state === 'suspended') c.resume(); }

function on(){ return S.sound !== false && ac(); }

// one shaped sine/triangle blip
function tone(freq, t0, dur, { type='sine', gain=0.06, glideTo=null, pan=0 }={}){
  const c = ac(); if(!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if(glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let node = g;
  if(c.createStereoPanner){ const p = c.createStereoPanner(); p.pan.value = pan; g.connect(p); node = p; }
  o.connect(g); node.connect(c.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

export function sBoot(){ if(!on())return; const c=ac(), t=c.currentTime;
  tone(196,t,0.5,{type:'triangle',gain:0.05}); tone(294,t+0.08,0.5,{type:'triangle',gain:0.045});
  tone(440,t+0.16,0.7,{type:'sine',gain:0.05,glideTo:660}); }
export function sSend(){ if(!on())return; const c=ac(); tone(680,c.currentTime,0.12,{type:'sine',gain:0.05,glideTo:920,pan:0.2}); }
export function sReceive(){ if(!on())return; const c=ac(),t=c.currentTime; tone(523,t,0.18,{gain:0.04,pan:-0.2}); tone(784,t+0.04,0.22,{gain:0.035}); }
export function sListen(){ if(!on())return; const c=ac(); tone(880,c.currentTime,0.1,{type:'sine',gain:0.05,glideTo:1180}); }
export function sStop(){ if(!on())return; const c=ac(); tone(420,c.currentTime,0.14,{type:'sine',gain:0.05,glideTo:240}); }
export function sConfirm(){ if(!on())return; const c=ac(),t=c.currentTime; tone(660,t,0.1,{gain:0.05}); tone(990,t+0.07,0.16,{gain:0.045}); }
export function sError(){ if(!on())return; const c=ac(),t=c.currentTime; tone(300,t,0.16,{type:'sawtooth',gain:0.035,glideTo:200}); }
