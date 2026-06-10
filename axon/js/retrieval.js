// retrieval.js — pure functions for recall and text handling. No DOM, fully testable.
// Scoring is BM25-flavored with light stemming, so "studying cardiology" finds "study: cardiac".

const STOP = new Set('the a an of to in on for and or is are was were be been being i you he she it we they my your this that with as at by from about into over after under what when where how why do does did can could should would will not no yes me him her them us our their tell show give'.split(' '));

// crude but effective suffix stemmer
export function stem(w){
  if(w.length <= 4) return w;
  return w.replace(/(ies|ied)$/,'y').replace(/(ing|edly|ed|ly|es|s)$/,'').replace(/(tion|sion)$/,'t');
}
export function toks(s){
  return (s||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/)
    .filter(w=>w.length>2 && !STOP.has(w)).map(stem);
}

// BM25-ish: term frequency saturation + length normalization + title boost.
// Recency and active-space only order among matches; they never admit irrelevant items.
export function retrieve(query, entries, activeSpaceId, limit=6){
  const q = [...new Set(toks(query))];
  if(!q.length) return [];
  const N = entries.length || 1;
  const df = {};
  const docs = entries.map(e=>{
    const title = toks(e.title), body = toks(e.body);
    const tf = {};
    for(const w of body) tf[w] = (tf[w]||0)+1;
    for(const w of title) tf[w] = (tf[w]||0)+3;
    for(const w of new Set([...title,...body])) df[w] = (df[w]||0)+1;
    return { e, tf, len: body.length+title.length };
  });
  const avgLen = docs.reduce((a,d)=>a+d.len,0)/N || 1;
  const k1 = 1.4, b = 0.6;
  const scored = docs.map(d=>{
    let s = 0;
    for(const w of q){
      const f = d.tf[w]; if(!f) continue;
      const idf = Math.log(1 + (N - (df[w]||0) + .5)/((df[w]||0) + .5));
      s += idf * (f*(k1+1)) / (f + k1*(1 - b + b*d.len/avgLen));
    }
    if(s <= 0) return { e:d.e, s:0 };
    if(d.e.spaceId === activeSpaceId) s *= 1.25;
    const days = (Date.now() - new Date(d.e.updatedAt||d.e.createdAt).getTime())/8.64e7;
    s += Math.max(0, 1 - days/60) * 0.3;
    return { e:d.e, s };
  }).filter(x=>x.s>0).sort((a,b2)=>b2.s-a.s).slice(0,limit);
  return scored.map(x=>x.e);
}

export function relevantMemories(query, memories, limit=6){
  const q = new Set(toks(query));
  const scored = memories.map(m=>{
    const mt = new Set(toks(m.text));
    let s = 0; q.forEach(w=>{ if(mt.has(w)) s++; });
    return {m, s};
  });
  const hits = scored.filter(x=>x.s>0).sort((a,b)=>b.s-a.s).map(x=>x.m);
  const recent = memories.slice().sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')).slice(0,3);
  const merged = [...new Map([...hits, ...recent].map(m=>[m.id,m])).values()];
  return merged.slice(0,limit);
}

// Split long text into passages near `size` chars on sentence boundaries.
export function chunkText(t, size=800){
  t = (t||'').replace(/\s+/g,' ').trim();
  if(!t) return [];
  const parts = t.split(/(?<=[.!?])\s+/);
  const out = []; let cur = '';
  for(const p of parts){
    if((cur+' '+p).length > size){ if(cur) out.push(cur.trim()); cur = p; }
    else cur += ' ' + p;
  }
  if(cur.trim()) out.push(cur.trim());
  return out.length ? out : [t];
}

// Build a clean alternating message list for the model from stored history.
// Returns trailing turns within budget, guaranteed to start with a user turn and alternate.
export function trimHistory(history, budgetChars=6000){
  const kept = []; let used = 0;
  for(let i=history.length-1; i>=0; i--){
    const m = history[i];
    const len = (m.content||'').length;
    if(used + len > budgetChars) break;
    kept.unshift(m); used += len;
  }
  while(kept.length && kept[0].role !== 'user') kept.shift();
  const clean = [];
  for(const m of kept){
    if(clean.length && clean[clean.length-1].role === m.role) clean[clean.length-1] = m;
    else clean.push(m);
  }
  return clean;
}
