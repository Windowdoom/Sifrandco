// ui.js — drawers (spaces, memory, settings), badges, and material ingestion.
import { S, state, saveS, uid, now, idbPut, idbDel, refreshMirrors, activeSpace, spaceColor } from './store.js';
import { chunkText } from './retrieval.js';
import { gpuOK, resetLocalEngine } from './ai.js';
import { SR, listVoices } from './voice.js';

const esc = s => (s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let reply = ()=>{};
export function setReply(fn){ reply = fn; }

export function updateBadges(){
  const on = (S.engine==='api'&&S.apiKey) || S.engine==='local';
  document.getElementById('aiDot').className = 'dot'+(on?' on':'');
  document.getElementById('aiTxt').textContent = S.engine==='api' ? (S.apiKey?'Claude':'API, no key') : S.engine==='local' ? 'local brain' : 'offline';
}
export function updateSpacePill(){ const s = activeSpace(); if(s) document.getElementById('spacePill').textContent = s.icon+' '+s.name; }

let onSpaceChange = ()=>{};
export function setOnSpaceChange(fn){ onSpaceChange = fn; }

export function openDrawer(v){ renderDrawer(v); document.getElementById('drawer').classList.add('open'); document.getElementById('scrim').classList.add('open'); }
export function closeDrawer(){ document.getElementById('drawer').classList.remove('open'); document.getElementById('scrim').classList.remove('open'); }
function rerender(){ const d=document.getElementById('drawer'); if(d.classList.contains('open')) renderDrawer(d.dataset.v); }
function renderDrawer(v){ const d=document.getElementById('drawer'); d.dataset.v=v; d.innerHTML = v==='spaces'?dSpaces():v==='memory'?dMemory():v==='space'?dSpaceDetail(d.dataset.sid):dSettings(); }

/* spaces */
function dSpaces(){
  return `<h3>Spaces <button class="x" onclick="AX.closeDrawer()">×</button></h3>
  <div class="sub">Each space is a room in your brain. The room you are in gets weighted higher when AXON recalls.</div>
  ${state.spaces.map(s=>{ const n=state.entries.filter(e=>e.spaceId===s.id).length; return `<div class="card act" onclick="AX.enterSpace('${s.id}')"><div class="ch"><span><span class="spacedot" style="background:${s.color}"></span>${esc(s.name)} ${s.id===S.activeSpace?'<span class="tg">active</span>':''}</span><span style="font-family:var(--mono);font-size:11px;color:var(--dim)">${n}</span></div></div>`; }).join('')}
  <div class="dsec" style="margin-top:16px"><div class="ttl">New space</div><div class="field"><input id="ns" placeholder="e.g. Health, Travel, Ideas"></div><button class="gbtn go" onclick="AX.addSpace()">Create space</button></div>`;
}
export async function addSpace(){ const v=document.getElementById('ns').value.trim(); if(!v) return; const s={id:uid(),name:v,icon:'●',color:spaceColor(state.spaces.length),createdAt:now()}; await idbPut('spaces',s); state.spaces.push(s); rerender(); }
export function enterSpace(id){ S.activeSpace=id; saveS(); updateSpacePill(); const d=document.getElementById('drawer'); d.dataset.sid=id; renderDrawer('space'); onSpaceChange(); }

function dSpaceDetail(sid){
  const s = state.spaces.find(x=>x.id===sid) || activeSpace();
  const list = state.entries.filter(e=>e.spaceId===s.id).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));
  return `<h3><span><span class="spacedot" style="background:${s.color}"></span>${esc(s.name)}</span><button class="x" onclick="AX.openDrawer('spaces')">‹</button></h3>
  <div class="sub">${list.length} notes. This is part of what AXON recalls for you.</div>
  <div class="dsec"><div class="ttl">Feed me material</div>
    <div class="field"><label>Upload sources for recall (.txt, .md, .pdf)</label><input type="file" id="mat" multiple accept=".txt,.md,.pdf,text/plain"></div>
    <button class="gbtn go" onclick="AX.addMaterial('${s.id}')">Ingest into ${esc(s.name)}</button>
    <div class="fhint" style="margin-top:7px">I split each file into passages and pull the relevant ones into answers. Text is most reliable. PDFs need a connection the first time to load the reader.</div></div>
  <div class="dsec"><div class="ttl">Add a note</div>
    <div class="field"><input id="et" placeholder="Title"></div>
    <div class="field"><textarea id="eb" placeholder="A fact, an idea, a draft, a reference"></textarea></div>
    <div class="field"><label>Attach files (kept on this device)</label><input type="file" id="ef" multiple></div>
    <button class="gbtn go" onclick="AX.addEntry('${s.id}')">Save note</button></div>
  <div class="dsec"><div class="ttl">Notes</div>
  ${list.length?list.map(e=>`<div class="card"><div class="ch">${esc(e.title)} ${(e.tags||[]).includes('material')?'<span class="tg">material</span>':''}</div>${e.body?`<div class="cb">${esc(e.body).slice(0,260)}</div>`:''}${(e.attachments||[]).map(a=>`<div class="cm">📎 <a style="color:var(--sig)" href="${a.data}" download="${esc(a.name)}">${esc(a.name)}</a></div>`).join('')}<div style="margin-top:8px"><button class="gbtn" onclick="AX.delEntry('${e.id}')">Delete</button></div></div>`).join(''):'<div style="color:var(--dim);font-size:13px">Empty. Add your first note or feed me material.</div>'}</div>`;
}
function readFiles(fl){ return Promise.all([...fl].map(f=>new Promise(r=>{ const rd=new FileReader(); rd.onload=()=>r({name:f.name,type:f.type,data:rd.result}); rd.readAsDataURL(f); }))); }
export async function addEntry(sid){
  const t=document.getElementById('et').value.trim(), b=document.getElementById('eb').value.trim();
  if(!t&&!b) return;
  const files=await readFiles(document.getElementById('ef').files);
  const e={ id:uid(), spaceId:sid, title:t||b.split(/[.\n]/)[0].slice(0,60), body:b, tags:[], attachments:files, createdAt:now(), updatedAt:now() };
  await idbPut('entries',e); state.entries.push(e); renderDrawer('space');
}
export async function delEntry(id){ await idbDel('entries',id); state.entries=state.entries.filter(e=>e.id!==id); renderDrawer('space'); }

async function extractText(file){
  const name=(file.name||'').toLowerCase();
  if(name.endsWith('.pdf')){
    const pdfjs = await import('https://esm.run/pdfjs-dist/build/pdf.min.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://esm.run/pdfjs-dist/build/pdf.worker.min.mjs';
    const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    let text=''; for(let i=1;i<=doc.numPages;i++){ const pg=await doc.getPage(i); const c=await pg.getTextContent(); text += c.items.map(it=>it.str).join(' ')+'\n'; }
    return text;
  }
  return await file.text();
}
export async function addMaterial(sid){
  const inp=document.getElementById('mat'); if(!inp.files.length){ reply('Pick a file or two first.'); return; }
  reply('Ingesting material...');
  let added=0, failed=[];
  for(const f of inp.files){
    try{ const text=await extractText(f); const chunks=chunkText(text); for(let i=0;i<chunks.length;i++){ const e={ id:uid(), spaceId:sid, title:f.name+(chunks.length>1?' · part '+(i+1):''), body:chunks[i], tags:['material'], source:f.name, attachments:[], createdAt:now(), updatedAt:now() }; await idbPut('entries',e); state.entries.push(e); added++; } }
    catch(err){ failed.push(f.name); }
  }
  renderDrawer('space');
  let msg = added?`Ingested ${added} passage${added===1?'':'s'}. I will pull from them when relevant.`:'Nothing ingested.';
  if(failed.length) msg += ` Could not read: ${failed.join(', ')}. Try a .txt version.`;
  reply(msg);
}

/* memory */
function dMemory(){
  const list=state.memories.slice().sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
  return `<h3>Memory <button class="x" onclick="AX.closeDrawer()">×</button></h3>
  <div class="sub">Facts you have taught me. I pull the relevant ones into every answer. This is how I get more useful over time.</div>
  <div class="dsec"><div class="ttl">Teach me something</div><div class="field"><textarea id="nm" placeholder="e.g. I prefer concise answers. My Step 2 target is 245."></textarea></div><button class="gbtn go" onclick="AX.addMem()">Remember it</button></div>
  <div class="dsec"><div class="ttl">What I hold <span style="color:var(--dim)">${list.length}</span></div>
  ${list.length?list.map(m=>`<div class="card"><div class="cb" style="margin-top:0">${esc(m.text)}</div><div style="margin-top:8px"><button class="gbtn" onclick="AX.delMem('${m.id}')">Forget</button></div></div>`).join(''):'<div style="color:var(--dim);font-size:13px">Nothing yet.</div>'}</div>`;
}
export async function addMem(){ const v=document.getElementById('nm').value.trim(); if(!v) return; const m={id:uid(),text:v,createdAt:now(),source:'manual'}; await idbPut('memories',m); state.memories.push(m); renderDrawer('memory'); }
export async function delMem(id){ await idbDel('memories',id); state.memories=state.memories.filter(m=>m.id!==id); renderDrawer('memory'); }

/* settings */
function dSettings(){
  return `<h3>Settings <button class="x" onclick="AX.closeDrawer()">×</button></h3>
  <div class="sub">AXON takes notes, remembers, and recalls fully offline. The brain and voice are yours to choose.</div>
  <div class="dsec"><div class="ttl">Brain</div>
    <div class="field"><label>Which brain answers</label><select id="set_engine">
      <option value="off" ${S.engine==='off'?'selected':''}>Off — notes and recall only</option>
      <option value="api" ${S.engine==='api'?'selected':''}>Claude — online, strongest, needs key</option>
      <option value="local" ${S.engine==='local'?'selected':''}>Local model — offline on your Mac, free</option>
    </select><div class="fhint">Local runs on your machine with no internet after the first download. Weaker than Claude, so feed it your material for accuracy. Switch to Claude when an answer must be right.</div></div>
    <div class="field"><label>Anthropic API key (for Claude)</label><input type="password" id="set_key" value="${esc(S.apiKey)}" placeholder="sk-ant-..."><div class="fhint">Stored only in this browser. Sent only to Anthropic.</div></div>
    <div class="field"><label>Claude model</label><select id="set_model">
      <option value="claude-sonnet-4-6" ${S.model==='claude-sonnet-4-6'?'selected':''}>Sonnet 4.6 — everyday default</option>
      <option value="claude-opus-4-8" ${S.model==='claude-opus-4-8'?'selected':''}>Opus 4.8 — deeper</option>
      <option value="claude-fable-5" ${S.model==='claude-fable-5'?'selected':''}>Fable 5 — heavy work, priciest</option>
    </select></div>
    <div class="field"><label>Local model${gpuOK()?'':' (no WebGPU in this browser)'}</label><select id="set_local">
      <option value="Llama-3.2-1B-Instruct-q4f16_1-MLC" ${S.localModel.startsWith('Llama-3.2-1B')?'selected':''}>Llama 3.2 1B — tiny, ~1GB, fastest</option>
      <option value="Llama-3.2-3B-Instruct-q4f16_1-MLC" ${S.localModel.startsWith('Llama-3.2-3B')?'selected':''}>Llama 3.2 3B — balanced, ~2GB</option>
      <option value="Llama-3.1-8B-Instruct-q4f32_1-MLC" ${S.localModel.startsWith('Llama-3.1-8B')?'selected':''}>Llama 3.1 8B — fullest, ~5GB, best knowledge</option>
    </select><div class="fhint">Bigger means smarter and a larger one-time download. Your Apple Silicon handles 8B well.</div></div></div>
  <div class="dsec"><div class="ttl">Voice</div>
    <div class="toggle-row"><span class="tlbl">Speak replies<small>${'speechSynthesis' in window?'Speaks as the text appears':'Not supported here'}</small></span><label class="switch"><input type="checkbox" id="set_speak" ${S.speak?'checked':''}><span class="sl"></span></label></div>
    <div class="field"><label>Voice</label><select id="set_voice"><option value="">Auto (most natural available)</option>${listVoices().map(v=>`<option value="${esc(v.voiceURI)}" ${S.voiceURI===v.voiceURI?'selected':''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select><div class="fhint">For the smoothest sound on a Mac, install an enhanced voice once in System Settings, Accessibility, Spoken Content, Manage Voices (look for Siri or Enhanced voices), then reopen this list.</div></div>
    <div class="toggle-row"><span class="tlbl">Interface sounds<small>Subtle synthesized cues for send, reply, and listen</small></span><label class="switch"><input type="checkbox" id="set_sound" ${S.sound!==false?'checked':''}><span class="sl"></span></label></div>
    <div class="toggle-row"><span class="tlbl">Voice input<small>${SR?'Tap the mic to talk':'Needs Chrome, Edge, or Safari'}</small></span><span style="font-family:var(--mono);font-size:11px;color:${SR?'var(--green)':'var(--dim)'}">${SR?'ready':'off'}</span></div></div>
  <button class="savebtn" onclick="AX.saveSettings()">Save settings</button>
  <div class="dsec" style="margin-top:22px"><div class="ttl">What AXON knows about you</div>
    <div class="field"><textarea id="set_profile" style="min-height:150px">${esc(S.profile)}</textarea><div class="fhint">This shapes every answer. It is pre-filled with what I already know about you. Edit it freely, add anything that would help present or future you, and remove anything you would rather it not assume. Discrete facts live in the Memory panel.</div></div>
    <button class="gbtn go" onclick="AX.saveProfile()">Save profile</button></div>
  <div class="dsec" style="margin-top:22px"><div class="ttl">Your brain, backed up</div>
    <button class="gbtn" onclick="AX.exportAll()">Export everything</button>
    <button class="gbtn" onclick="document.getElementById('imp').click()">Import</button>
    <input type="file" id="imp" accept=".json" style="display:none" onchange="AX.importAll(this.files[0])">
    <div class="fhint" style="margin-top:8px">${state.spaces.length} spaces · ${state.entries.length} notes · ${state.memories.length} memories</div>
    <div style="margin-top:10px"><button class="dangerbtn" onclick="AX.wipe()">Erase everything</button></div></div>`;
}
export function saveSettings(){
  S.engine=document.getElementById('set_engine').value;
  S.apiKey=document.getElementById('set_key').value.trim();
  S.model=document.getElementById('set_model').value;
  const lm=document.getElementById('set_local').value; if(lm!==S.localModel){ S.localModel=lm; resetLocalEngine(); }
  S.speak=document.getElementById('set_speak').checked;
  S.sound=document.getElementById('set_sound').checked;
  S.voiceURI=document.getElementById('set_voice').value;
  saveS(); updateBadges(); renderDrawer('settings');
  reply(S.engine==='api'?(S.apiKey?'Saved. Claude is online.':'Saved. Add your key to use Claude.'):S.engine==='local'?'Saved. The local brain loads on your next question.':'Saved. Reasoning is off, notes and recall still work.');
}
export function saveProfile(){ S.profile=document.getElementById('set_profile').value.trim(); saveS(); reply('Updated what I know about you.'); }
export async function exportAll(){ const dump={spaces:state.spaces,entries:state.entries,memories:state.memories,settings:S}; const b=new Blob([JSON.stringify(dump,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='axon-brain-'+new Date().toISOString().slice(0,10)+'.json'; a.click(); }
export async function importAll(f){ if(!f) return; const r=new FileReader(); r.onload=async()=>{ try{ const d=JSON.parse(r.result); for(const s of(d.spaces||[]))await idbPut('spaces',s); for(const e of(d.entries||[]))await idbPut('entries',e); for(const m of(d.memories||[]))await idbPut('memories',m); if(d.settings){ Object.assign(S,d.settings); saveS(); } await refreshMirrors(); updateBadges(); updateSpacePill(); renderDrawer('settings'); reply('Brain imported.'); }catch(e){ reply('Could not read that file.'); } }; r.readAsText(f); }
export async function wipe(){ if(!confirm('Erase all spaces, notes, and memories on this device? Cannot be undone without a backup.')) return; for(const s of state.spaces)await idbDel('spaces',s.id); for(const e of state.entries)await idbDel('entries',e.id); for(const m of state.memories)await idbDel('memories',m.id); localStorage.removeItem('axon_migrated'); S.activeSpace=null; saveS(); location.reload(); }
