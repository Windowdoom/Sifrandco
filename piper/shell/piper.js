/* Piper — the shell. One conversation, streamed. Voice in and out.
   Talks to the local Piper core over SSE. No framework, no cloud by default. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const stream=$("stream"), form=$("say"), input=$("text"), mic=$("mic"), convo=$("convo"),
        speakToggle=$("speakToggle"), ambient=$("ambient"), brain=$("brain"), mark=$("mark"),
        arcs=$("arcs"), memBtn=$("memBtn"), panel=$("panel"), panelBody=$("panel-body"),
        panelTitle=$("panel-title"), panelClose=$("panel-close");

  const history=[]; let busy=false, started=false, speakOn=true, convoMode=false;

  // ── opening veil ──
  function veil(){
    stream.innerHTML =
      '<div class="veil"><div class="big">صفر</div>'+
      '<div>bismillah. the point from which everything begins.</div>'+
      '<div class="sugs">'+
      ['what should I focus on today','quiz me on cardiology','what is the ruling on combining prayers',
       'summarize where I am in my arcs'].map(q=>`<button class="sug">${q}</button>`).join('')+
      '</div></div>';
    stream.querySelectorAll(".sug").forEach(b=>b.onclick=()=>ask(b.textContent));
  }
  const clearVeil=()=>{ const v=stream.querySelector(".veil"); if(v) v.remove(); };

  function addTurn(who, text){
    clearVeil();
    const turn=document.createElement("div"); turn.className="turn "+who;
    const label=document.createElement("div"); label.className="who"; label.textContent=who==="prime"?"prime":"piper";
    const said=document.createElement("div"); said.className="said"; said.textContent=text;
    turn.append(label, said); stream.append(turn); stream.scrollTop=stream.scrollHeight;
    return said;
  }

  // ── speech out ──
  let voices=[];
  const loadVoices=()=>{ voices=("speechSynthesis"in window)?speechSynthesis.getVoices():[]; };
  if("speechSynthesis"in window){ loadVoices(); speechSynthesis.onvoiceschanged=loadVoices; }
  function pickVoice(){
    const en=voices.filter(v=>/en/i.test(v.lang));
    const score=v=>{let s=0;const n=(v.name||"").toLowerCase();
      if(/enhanced|premium|natural|neural|siri/.test(n))s+=5;
      if(/ava|samantha|serena|daniel|arthur|tom|evan/.test(n))s+=2; if(v.localService)s+=1; return s;};
    return en.sort((a,b)=>score(b)-score(a))[0]||voices[0]||null;
  }
  function clean(t){return (t||"").replace(/\[[^\]]*\]/g,"").replace(/https?:\/\/\S+/g,"")
    .replace(/[*#`>_~|]/g,"").replace(/\s+/g," ").trim();}
  let spoken="";
  function speakChunk(full){
    if(!speakOn||!("speechSynthesis"in window))return;
    const fresh=full.slice(spoken.length); const m=fresh.match(/^[\s\S]*[.!?\n](\s|$)/);
    if(!m)return; const seg=fresh.slice(0,m[0].length); spoken+=seg;
    const t=clean(seg); if(!t)return;
    const u=new SpeechSynthesisUtterance(t); const v=pickVoice(); if(v)u.voice=v; u.rate=1.0;
    if(convoMode) u.onend=()=>{ if(convoMode&&!busy) setTimeout(startListen,300); };
    speechSynthesis.speak(u);
  }
  function speakRest(full){ if(!speakOn)return; const t=clean(full.slice(spoken.length)); spoken=full;
    if(!t)return; const u=new SpeechSynthesisUtterance(t); const v=pickVoice(); if(v)u.voice=v;
    if(convoMode) u.onend=()=>{ if(convoMode&&!busy) setTimeout(startListen,300); };
    speechSynthesis.speak(u); }

  // ── ask the core (SSE) ──
  async function ask(text, opts={}){
    text=(text||"").trim(); if(busy||!text)return; busy=true;
    if("speechSynthesis"in window) speechSynthesis.cancel(); spoken="";
    addTurn("prime", text); const said=addTurn("piper",""); said.classList.add("caret");
    let reply="";
    try{
      const res=await fetch("/ask",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({text, history:history.slice(-8), voice:!!opts.voice})});
      const reader=res.body.getReader(); const dec=new TextDecoder(); let buf="";
      while(true){
        const {value,done}=await reader.read(); if(done)break;
        buf+=dec.decode(value,{stream:true}); const parts=buf.split("\n\n"); buf=parts.pop();
        for(const p of parts){
          const line=p.replace(/^data: /,"").trim(); if(!line)continue;
          let o; try{o=JSON.parse(line);}catch{continue;}
          if(o.confirm){ showConfirm(o.confirm, o.cid); }
          else if(o.t){ reply+=o.t; said.textContent=reply; stream.scrollTop=stream.scrollHeight; speakChunk(reply); }
        }
      }
    }catch(e){ reply=reply||"the mind is unreachable from here."; said.textContent=reply; }
    finally{
      said.classList.remove("caret"); speakRest(reply);
      history.push({user:text, piper:reply}); busy=false; input.focus();
    }
  }

  form.addEventListener("submit", e=>{ e.preventDefault(); const t=input.value; input.value=""; ask(t); });

  // ── per-action confirm card ──
  function showConfirm(act, cid){
    clearVeil();
    const card=document.createElement("div"); card.className="turn confirm-card";
    const a=(act.args||{}); const argstr=Object.keys(a).map(k=>k+": "+JSON.stringify(a[k])).join("\n");
    card.innerHTML='<div class="who">piper wants to act</div>'+
      '<div class="cfm-tool">'+(act.tool||"")+(act.desc?' — '+act.desc:'')+'</div>'+
      '<pre class="cfm-args">'+argstr.replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]))+'</pre>'+
      '<div class="cfm-btns"><button class="cfm-no">deny</button><button class="cfm-yes">approve</button></div>';
    stream.appendChild(card); stream.scrollTop=stream.scrollHeight;
    const decide=ok=>{ fetch("/resume",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({cid,ok})}); card.querySelectorAll("button").forEach(b=>b.disabled=true);
        card.classList.add(ok?"approved":"denied");
        card.querySelector(".cfm-btns").innerHTML='<span class="cfm-done">'+(ok?"approved":"denied")+'</span>'; };
    card.querySelector(".cfm-yes").onclick=()=>decide(true);
    card.querySelector(".cfm-no").onclick=()=>decide(false);
  }

  // ── speech in ──
  let recog=null; const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  function startListen(){ if(!recog||mic.classList.contains("live"))return; mic.classList.add("live");
    try{recog.start();}catch{mic.classList.remove("live");} }
  if(SR){
    recog=new SR(); recog.lang="en-US"; recog.interimResults=false;
    recog.onresult=ev=>{ const t=ev.results[0][0].transcript; mic.classList.remove("live"); ask(t,{voice:convoMode}); };
    recog.onend=()=>mic.classList.remove("live");
    recog.onerror=()=>{ mic.classList.remove("live"); if(convoMode){convoMode=false;convo.classList.remove("live");} };
    mic.onclick=()=>{ if(mic.classList.contains("live")){recog.stop();return;} startListen(); };
    convo.onclick=()=>{ convoMode=!convoMode; convo.classList.toggle("live",convoMode);
      if(convoMode) startListen(); else recog.stop(); };
  } else {
    mic.onclick=()=>input.focus(); mic.title="voice input needs Chrome, Edge, or Safari";
    convo.onclick=()=>input.focus();
  }
  speakToggle.onclick=()=>{ speakOn=!speakOn; speakToggle.classList.toggle("off",!speakOn);
    if(!speakOn&&"speechSynthesis"in window)speechSynthesis.cancel(); };

  // ── ambient line + brain indicator ──
  async function tick(){
    try{ const s=await (await fetch("/state")).json(); ambient.textContent=s.ambient||""; }catch{}
    try{ const st=await (await fetch("/status")).json();
      brain.textContent=st.brain||"·"; brain.className=st.brain==="ollama"?"on":st.brain==="claude"?"api":"";
    }catch{}
  }
  setInterval(tick, 30000);

  // ── the six arcs ──
  mark.onclick=()=>{ arcs.hidden=!arcs.hidden; };
  arcs.onclick=e=>{ if(e.target===arcs) arcs.hidden=true; };
  document.querySelectorAll(".arc").forEach(a=>a.onclick=()=>{
    arcs.hidden=true; ask("Where do I stand in my "+a.querySelector("span").textContent+" arc, and what is the next move?");
  });

  // ── memory panel ──
  memBtn.onclick=async()=>{
    panel.classList.add("open"); panelTitle.textContent="memory";
    panelBody.innerHTML='<div class="mem-empty">recalling…</div>';
    try{ const d=await (await fetch("/memory")).json(); const ms=d.memories||[];
      panelBody.innerHTML = ms.length ? ms.map(m=>`<div class="mem"><div class="k">${m.kind}</div><div class="x">${(m.text||"").replace(/[<>]/g,"")}</div></div>`).join("")
        : '<div class="mem-empty">nothing yet. teach me with "remember that…".</div>';
    }catch{ panelBody.innerHTML='<div class="mem-empty">memory is unreachable.</div>'; }
  };
  panelClose.onclick=()=>panel.classList.remove("open");

  document.addEventListener("keydown", e=>{
    if(e.key==="Escape"){ arcs.hidden=true; panel.classList.remove("open"); if("speechSynthesis"in window)speechSynthesis.cancel(); }
    if((e.metaKey||e.ctrlKey)&&e.key==="k"){ e.preventDefault(); input.focus(); }
  });

  // ── boot (open mode: no lock on the portable build) ──
  function boot(){ if(!started){ started=true; veil(); tick(); } input.focus(); }
  boot();
})();
