// dom.js — core animation state and the transcript. Wires render.js output into the page.
import { renderRich, renderStreaming } from './render.js';

let lastInteraction = Date.now();
export function touch(){ lastInteraction = Date.now(); }
export function idleMs(){ return Date.now() - lastInteraction; }

export function setState(s){
  document.body.classList.remove('listening','thinking','speaking');
  const map = { listening:'listening', thinking:'thinking', speaking:'responding' };
  const el = document.getElementById('coreState');
  if(s){ document.body.classList.add(s); el.textContent = map[s]||''; }
  else el.textContent = '';
  document.getElementById('stopBtn')?.classList.toggle('show', s==='thinking');
}

const logEl = () => document.getElementById('log');
function nearBottom(){ const l = logEl(); return l.scrollHeight - l.scrollTop - l.clientHeight < 120; }
function sc(force){ const l = logEl(); if(force || nearBottom()) l.scrollTop = l.scrollHeight; }

export function pushUser(t){
  document.body.classList.add('chatting'); touch();
  const d = document.createElement('div'); d.className = 'line user'; d.textContent = t;
  logEl().appendChild(d); sc(true);
}
export function pushSys(t){
  const d = document.createElement('div'); d.className = 'line sys'; d.textContent = t;
  logEl().appendChild(d); sc(true);
}

// Returns a handle to update the assistant line as tokens stream in.
export function pushAxon(initial, ctxLabel){
  document.body.classList.add('chatting'); touch();
  const d = document.createElement('div'); d.className = 'line axon';
  d.innerHTML = '<span class="who">AXON</span><div class="body"></div>' + (ctxLabel?`<div class="ctx">${ctxLabel}</div>`:'');
  const body = d.querySelector('.body');
  body.textContent = initial || '';
  logEl().appendChild(d); sc(true);
  let raw = initial || '';
  return {
    el: d,
    getText(){ return raw; },
    setPlain(t){ raw = t; body.textContent = t; sc(); },
    setStream(t){ raw = t; body.innerHTML = renderStreaming(t) + '<span class="cursor"></span>'; sc(); },
    finalize(t, onActions, srcLabel){
      raw = t;
      const { html, mermaid, quiz } = renderRich(t);
      body.innerHTML = html;
      wireCopyButtons(body);
      finishRich(body, mermaid, quiz);
      if(srcLabel){ const c = document.createElement('div'); c.className='ctx'; c.textContent = srcLabel; d.appendChild(c); }
      if(onActions) onActions(d);
      sc();
    }
  };
}

function wireCopyButtons(container){
  container.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click', ()=>{
    const code = b.closest('.rc-codewrap')?.querySelector('.rc-code')?.textContent || '';
    navigator.clipboard?.writeText(code).then(()=>{ b.textContent='copied'; setTimeout(()=>b.textContent='copy', 1400); });
  }));
}

async function finishRich(container, mermaid, quiz){
  for(const q of quiz){
    const host = container.querySelector('#'+q.id);
    if(host) buildQuiz(host, q.cards);
  }
  if(mermaid.length){
    try{
      const m = await import('https://esm.run/mermaid');
      const mer = m.default || m;
      mer.initialize({ startOnLoad:false, theme:'dark', themeVariables:{ primaryColor:'#0D2235', lineColor:'#5EE6D8', primaryTextColor:'#E8F1F8' } });
      for(const d of mermaid){
        const host = container.querySelector('#'+d.id);
        if(!host) continue;
        try{ const { svg } = await mer.render(d.id+'_svg', d.code); host.innerHTML = svg; }
        catch(e){ host.innerHTML = '<div class="rc-warn">Could not draw that diagram.</div>'; }
      }
    }catch(e){
      for(const d of mermaid){ const host = container.querySelector('#'+d.id); if(host) host.innerHTML = '<div class="rc-warn">Diagrams need a connection the first time.</div>'; }
    }
  }
}

function buildQuiz(host, cards){
  if(!Array.isArray(cards) || !cards.length){ host.innerHTML='<div class="rc-warn">No cards.</div>'; return; }
  let i = 0, revealed = false, correct = 0, graded = false;
  function draw(){
    const c = cards[i];
    host.innerHTML = `
      <div class="quiz">
        <div class="quiz-top">Card ${i+1} of ${cards.length}<span class="quiz-score">${correct}/${cards.length}</span></div>
        <div class="quiz-q">${(c.q||'').replace(/[<>]/g,'')}</div>
        <div class="quiz-a" style="display:${revealed?'block':'none'}">${(c.a||'').replace(/[<>]/g,'')}</div>
        <div class="quiz-btns">
          ${revealed ? `<button class="gbtn" data-act="got">Got it</button><button class="gbtn" data-act="miss">Missed</button>` : `<button class="gbtn go" data-act="reveal">Reveal</button>`}
        </div>
      </div>`;
    host.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
      const a = b.dataset.act;
      if(a==='reveal'){ revealed = true; draw(); return; }
      if(a==='got' && !graded){ correct++; }
      graded = true;
      if(i < cards.length-1){ i++; revealed=false; graded=false; draw(); }
      else host.innerHTML = `<div class="quiz"><div class="quiz-top">Done</div><div class="quiz-q">You got ${correct} of ${cards.length}.</div></div>`;
    }));
  }
  draw();
}
