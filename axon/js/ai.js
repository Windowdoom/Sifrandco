// ai.js — the reasoning layer. Conversation memory, retrieval grounding, Claude API with
// retries and abort, the local WebLLM brain, and a deterministic offline engine underneath.
// Fallback chain: instant offline answers -> chosen brain -> offline recall if the brain fails.
import { S, state, activeSpace, saveChatTurn } from './store.js';
import { retrieve, relevantMemories, trimHistory } from './retrieval.js';
import { pushAxon, setState } from './dom.js';
import { speak, makeSpeaker, speakingActive } from './voice.js';
import { offlineAnswer } from './offline.js';
import { bridgeOnline, bridgeInfo, runTool, TOOL_SCHEMAS } from './bridge.js';

export let history = [];
export function setHistory(h){ history = h || []; }
export function pushHistory(role, content){ history.push({ role, content }); }

let aborter = null;
export function stopGeneration(){ if(aborter){ aborter.abort(); aborter = null; } }
export function isGenerating(){ return !!aborter; }

function bridgeBlurb(){
  if(!bridgeOnline()) return '';
  const i = bridgeInfo();
  return `\n\nMACHINE ACCESS: You are connected to Danial's computer (${i.os||'local'}, home ${i.home||'~'}) through a local bridge. You have tools to list and read files, search his disk, write files, run shell commands, execute code you write, and open files or apps. Use them to actually do things, not just describe them. Reading and searching are free; writes, commands, code execution, and opening things ask Danial for one-tap confirmation, so propose the precise action. Prefer searching and reading his real files over guessing. Keep destructive operations minimal and explain them before proposing. When a task is done, report what you actually did and what came back.`;
}

export function sysPrompt(){
  const sp = activeSpace();
  const profile = S.profile ? `WHAT YOU KNOW ABOUT DANIAL:\n${S.profile}\n\n` : '';
  return profile + bridgeBlurb() + `You are AXON, the personal assistant for Danial. You help with anything he brings: medicine and USMLE study, writing and creative work, his tutoring business, faith and Quran or Arabic study, finances, planning, and daily life. Right now he is focused in the "${sp?sp.name:'General'}" space. Today is ${new Date().toDateString()}.

Voice: calm, capable, warm, a trusted chief of staff with light dry wit. Replies are often read aloud, so lead with the useful part and keep it tight unless he asks for depth. You remember the recent conversation, so follow the thread and resolve references like "that" or "it" from context.

You may be given AXON MEMORY (facts he told you) and RELEVANT MATERIAL (passages from his own knowledge base). Lean on them rather than guessing, and treat them as true.

You can show things, not only tell. When a visual helps, emit one of these fenced blocks and AXON renders it:
- A chart: \`\`\`chart {"type":"bar"|"line"|"pie","title":"...","labels":["A","B"],"data":[1,2]} \`\`\`
- A diagram of a process or structure: \`\`\`mermaid ... standard mermaid syntax ... \`\`\`
- Flashcards to test him: \`\`\`quiz [{"q":"...","a":"..."}] \`\`\`
- A custom drawing: \`\`\`svg ...inline svg... \`\`\`
Use visuals when they genuinely aid understanding, not for everything.

Never invent facts, citations, studies, statistics, dates, or sources. If unsure, say so plainly. For clinical or USMLE topics, reason discriminator-first and name the key discriminator and the trap. For Islamic topics, use authentic Sunni scholarship only and flag anything uncertain.

Style: no em dashes. Simple, natural language. No tables unless asked.`;
}

export function buildContext(question){
  const notes = retrieve(question, state.entries, S.activeSpace);
  const mems = relevantMemories(question, state.memories);
  let block = '';
  if(mems.length) block += 'AXON MEMORY:\n' + mems.map(m=>'- '+m.text).join('\n') + '\n\n';
  if(notes.length) block += 'RELEVANT MATERIAL from his knowledge base:\n' + notes.map(n=>`- [${state.spaces.find(s=>s.id===n.spaceId)?.name||'?'}] ${n.title}: ${(n.body||'').slice(0,500)}`).join('\n') + '\n\n';
  const label = (mems.length||notes.length) ? `recalled ${mems.length} memories, ${notes.length} passages` : '';
  return { block, label };
}

function finalizeReply(handle, text, srcLabel){
  handle.finalize(text, attachSaveAction(text), srcLabel);
  pushHistory('assistant', text);
  saveChatTurn(S.activeSpace, 'assistant', text);
}
let saveActionFactory = null;
export function setSaveActionFactory(fn){ saveActionFactory = fn; }
function attachSaveAction(text){ return saveActionFactory ? (el)=>saveActionFactory(el, text) : null; }

export async function ask(question, replyOffline){
  pushHistory('user', question);
  saveChatTurn(S.activeSpace, 'user', question);
  // deterministic engine first: math, units, dates, facts answer instantly, free, offline
  const inst = offlineAnswer(question);
  if(inst){
    const handle = pushAxon('');
    finalizeReply(handle, inst.text, 'answered offline · '+inst.source);
    speak(inst.text);
    return;
  }
  if(S.engine === 'local') return bridgeOnline() ? askLocalAgent(question) : askLocal(question);
  if(S.engine === 'api') return bridgeOnline() ? askAPIAgent(question) : askAPI(question);
  // no brain: try recall from the user's own knowledge before giving up
  const rec = offlineAnswer(question, { recallFallback:true });
  if(rec){
    const handle = pushAxon('');
    finalizeReply(handle, rec.text, 'answered offline · '+rec.source);
    speak(rec.text.split('\n')[0]);
    return;
  }
  return replyOffline();
}

async function fetchWithRetry(url, opts, tries=3){
  let lastErr;
  for(let i=0; i<tries; i++){
    try{
      const res = await fetch(url, opts);
      if(res.status===429 || res.status>=500){
        lastErr = new Error(res.status===429?'Rate limited.':'API error '+res.status);
        if(i<tries-1){ await new Promise(r=>setTimeout(r, 1200*(2**i))); continue; }
        throw lastErr;
      }
      return res;
    }catch(e){
      if(e.name==='AbortError') throw e;
      lastErr = e;
      if(i<tries-1) await new Promise(r=>setTimeout(r, 1200*(2**i)));
    }
  }
  throw lastErr;
}

// when the chosen brain dies mid-question, fall back to recall instead of a bare error
function failSoft(handle, err, question){
  if(err.name==='AbortError'){ handle.setPlain('Stopped.'); setState(null); return; }
  const rec = offlineAnswer(question, { recallFallback:true });
  if(rec){ finalizeReply(handle, `(${err.message})\n\n${rec.text}`, 'fell back to offline recall'); }
  else { handle.setPlain('⚠ '+err.message); speak(err.message); }
  setState(null);
}

async function askAPI(question){
  const ctx = buildContext(question);
  const handle = pushAxon('', ctx.label);
  if(!S.apiKey){ const m='The Claude brain needs your API key. Add it in Settings, or switch to the local model.'; handle.setPlain(m); speak(m); return; }
  setState('thinking');
  const msgs = trimHistory(history.slice(0,-1), 6000);
  msgs.push({ role:'user', content:(ctx.block?ctx.block+'---\n\n':'')+question });
  const speaker = makeSpeaker();
  aborter = new AbortController();
  try{
    const res = await fetchWithRetry('https://api.anthropic.com/v1/messages',{
      method:'POST', signal: aborter.signal,
      headers:{ 'content-type':'application/json','x-api-key':S.apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify({ model:S.model, max_tokens:1800, system:sysPrompt(), messages:msgs, stream:true })
    });
    if(!res.ok || !res.body){ const t = res.body?await res.text():''; throw new Error(res.status===401?'Your API key was rejected. Check it in Settings.':'API error '+res.status+'. '+t.slice(0,120)); }
    const reader = res.body.getReader(); const dec = new TextDecoder();
    let sse = '', text = '';
    while(true){
      const { done, value } = await reader.read();
      if(done) break;
      sse += dec.decode(value, { stream:true });
      let nl;
      while((nl = sse.indexOf('\n')) >= 0){
        const line = sse.slice(0, nl).trim(); sse = sse.slice(nl+1);
        if(!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if(payload === '[DONE]') continue;
        try{
          const ev = JSON.parse(payload);
          if(ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta'){
            const d = ev.delta.text || '';
            text += d; handle.setStream(text); speaker.feed(d);
          }
        }catch(e){}
      }
    }
    speaker.flush();
    finalizeReply(handle, text || 'No response came back.');
    if(!S.speak || !speakingActive()) setState(null);
  }catch(e){
    if(e.name==='AbortError' && handle.getText && handle.getText()){ speaker.flush(); finalizeReply(handle, handle.getText()); setState(null); }
    else failSoft(handle, e, question);
  }
  finally{ aborter = null; }
}

// ---- agentic Claude: tool-use loop over the machine bridge ----
const TOOL_LABEL = { list:'listing files', read:'reading', search:'searching the disk', write:'writing a file', exec:'running a command', run_code:'executing code', open:'opening' };

async function askAPIAgent(question){
  const ctx = buildContext(question);
  const handle = pushAxon('', ctx.label);
  if(!S.apiKey){ const m='The Claude brain needs your API key. Add it in Settings.'; handle.setPlain(m); speak(m); return; }
  setState('thinking');
  const msgs = trimHistory(history.slice(0,-1), 6000);
  msgs.push({ role:'user', content:(ctx.block?ctx.block+'---\n\n':'')+question });
  aborter = new AbortController();
  let finalText = '';
  try{
    for(let step=0; step<8; step++){
      const res = await fetchWithRetry('https://api.anthropic.com/v1/messages',{
        method:'POST', signal: aborter.signal,
        headers:{ 'content-type':'application/json','x-api-key':S.apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' },
        body: JSON.stringify({ model:S.model, max_tokens:2000, system:sysPrompt(), messages:msgs, tools:TOOL_SCHEMAS })
      });
      if(!res.ok){ const t=await res.text(); throw new Error(res.status===401?'Your API key was rejected.':'API error '+res.status+'. '+t.slice(0,120)); }
      const data = await res.json();
      const blocks = data.content || [];
      const text = blocks.filter(b=>b.type==='text').map(b=>b.text).join('').trim();
      if(text){ finalText = text; handle.setStream(finalText); }
      const toolUses = blocks.filter(b=>b.type==='tool_use');
      if(!toolUses.length || data.stop_reason!=='tool_use'){ break; }
      msgs.push({ role:'assistant', content: blocks });
      const results = [];
      for(const tu of toolUses){
        handle.setStream((finalText?finalText+'\n\n':'') + `_${TOOL_LABEL[tu.name]||tu.name}…_`);
        let out;
        try{ out = await runTool(tu.name, tu.input || {}); }
        catch(e){ out = { error:e.message }; }
        results.push({ type:'tool_result', tool_use_id:tu.id, content: JSON.stringify(out).slice(0, 12000) });
      }
      msgs.push({ role:'user', content: results });
      setState('thinking');
    }
    speak(finalText);
    finalizeReply(handle, finalText || 'Done.');
    if(!S.speak || !speakingActive()) setState(null);
  }catch(e){ failSoft(handle, e, question); }
  finally{ aborter = null; }
}

// ---- agentic local model: JSON-action protocol the small model can follow ----
function localAgentSys(){
  return sysPrompt() + `\n\nTO USE A TOOL, reply with ONLY a fenced block and nothing else:\n\`\`\`action\n{"tool":"search","args":{"query":"taxes","path":"~"}}\n\`\`\`\nTools: list{path}, read{path}, search{query,path}, write{path,content}, exec{cmd}, run_code{lang,code}, open{target}. After you see the RESULT, either call another tool the same way or give your final plain answer with no action block. Use at most a few tools.`;
}
async function askLocalAgent(question){
  const ctx = buildContext(question);
  const handle = pushAxon('Waking the local brain...', ctx.label);
  setState('thinking');
  aborter = new AbortController();
  try{
    const eng = await loadLocal(handle); handle.setPlain('');
    const convo = [{ role:'system', content:localAgentSys() }, ...trimHistory(history.slice(0,-1), 3000),
                   { role:'user', content:(ctx.block?ctx.block+'---\n\n':'')+question }];
    let finalText = '';
    for(let step=0; step<5; step++){
      if(aborter.signal.aborted) break;
      const r = await eng.chat.completions.create({ messages:convo, temperature:0.5, max_tokens:900 });
      const reply = r.choices?.[0]?.message?.content?.trim() || '';
      const m = reply.match(/```action\s*([\s\S]*?)```/);
      if(!m){ finalText = reply; handle.setStream(finalText); break; }
      let act; try{ act = JSON.parse(m[1].trim()); }catch(e){ finalText = reply; break; }
      handle.setStream(`_${TOOL_LABEL[act.tool]||act.tool}…_`);
      let out; try{ out = await runTool(act.tool, act.args||{}); }catch(e){ out = { error:e.message }; }
      convo.push({ role:'assistant', content: reply });
      convo.push({ role:'user', content: 'RESULT:\n' + JSON.stringify(out).slice(0, 6000) });
    }
    speak(finalText);
    finalizeReply(handle, finalText || 'Done.');
    if(!S.speak || !speakingActive()) setState(null);
  }catch(e){ failSoft(handle, e, question); }
  finally{ aborter = null; }
}

// ---- local offline brain ----
let localEngine = null, localLoading = false;
export function resetLocalEngine(){ localEngine = null; }
export function gpuOK(){ return typeof navigator!=='undefined' && !!navigator.gpu; }

async function loadLocal(handle){
  if(localEngine) return localEngine;
  if(localLoading) throw new Error('Model is still loading. One moment.');
  if(!gpuOK()) throw new Error('This browser has no WebGPU. Use a recent Chrome, Edge, or Safari.');
  localLoading = true;
  try{
    const webllm = await import('https://esm.run/@mlc-ai/web-llm');
    localEngine = await webllm.CreateMLCEngine(S.localModel, { initProgressCallback:p=>{
      const pct = p.progress!=null ? Math.round(p.progress*100) : null;
      handle.setPlain('Loading local brain'+(pct!=null?' '+pct+'%':'')+'. First time downloads the model, then it is cached and runs offline.');
      handle.setProgress && handle.setProgress(pct);
    }});
    return localEngine;
  }catch(e){
    localEngine = null;
    if(/Failed to fetch|NetworkError|import/i.test(e.message)) throw new Error('Could not download the model. The first load needs a connection. After that it runs offline.');
    throw e;
  }finally{ localLoading = false; }
}

async function askLocal(question){
  const ctx = buildContext(question);
  const handle = pushAxon('Waking the local brain...', ctx.label);
  setState('thinking');
  const speaker = makeSpeaker();
  aborter = new AbortController();
  const signal = aborter.signal;
  try{
    const eng = await loadLocal(handle);
    handle.setPlain('');
    const msgs = [{ role:'system', content:sysPrompt() }, ...trimHistory(history.slice(0,-1), 4000)];
    msgs.push({ role:'user', content:(ctx.block?ctx.block+'---\n\n':'')+question });
    const stream = await eng.chat.completions.create({ messages:msgs, stream:true, temperature:0.6, max_tokens:1024 });
    let text = '';
    for await (const chunk of stream){
      if(signal.aborted) break;
      const d = chunk.choices?.[0]?.delta?.content || '';
      if(d){ text += d; handle.setStream(text); speaker.feed(d); }
    }
    speaker.flush();
    finalizeReply(handle, text || 'No response came back.');
    if(!S.speak || !speakingActive()) setState(null);
  }catch(e){ failSoft(handle, e, question); }
  finally{ aborter = null; }
}

export async function summarizeConversation(){
  const convo = history.slice(-16).map(m=>(m.role==='user'?'Danial: ':'AXON: ')+m.content).join('\n');
  const prompt = `Summarize this conversation into a concise note for later. Capture the key points, decisions, and any facts worth keeping. Plain prose, no preamble.\n\n${convo}`;
  if(S.engine==='api' && S.apiKey){
    const res = await fetchWithRetry('https://api.anthropic.com/v1/messages',{ method:'POST', headers:{ 'content-type':'application/json','x-api-key':S.apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' }, body:JSON.stringify({ model:S.model, max_tokens:600, messages:[{role:'user',content:prompt}] }) });
    if(!res.ok) throw new Error('Could not summarize.');
    const data = await res.json();
    return (data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('\n').trim();
  }
  if(S.engine==='local' && localEngine){
    const stream = await localEngine.chat.completions.create({ messages:[{role:'user',content:prompt}], max_tokens:500 });
    return stream.choices?.[0]?.message?.content?.trim() || '';
  }
  return convo;
}
