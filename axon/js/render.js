// render.js — turns model text into rich HTML: markdown (now with tables, quotes, rules)
// plus chart, svg, quiz, and mermaid blocks. Pure (returns strings); DOM wiring in the caller.

export function escapeHtml(s){
  return (s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function mdInline(s){
  return s
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/~~([^~]+)~~/g,'<del>$1</del>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function mdBlock(text){
  const lines = text.split('\n');
  let html = '', list = null, quote = false, i = 0;
  const closeList = ()=>{ if(list){ html += `</${list}>`; list = null; } };
  const closeQuote = ()=>{ if(quote){ html += '</blockquote>'; quote = false; } };
  while(i < lines.length){
    const line = lines[i].replace(/\s+$/,'');
    // table: header row | separator row of ---
    if(/^\s*\|.+\|\s*$/.test(line) && i+1<lines.length && /^\s*\|[\s\-:|]+\|\s*$/.test(lines[i+1])){
      closeList(); closeQuote();
      const cells = r => r.trim().replace(/^\||\|$/g,'').split('|').map(c=>mdInline(c.trim()));
      html += '<table class="rc-table"><thead><tr>' + cells(line).map(c=>`<th>${c}</th>`).join('') + '</tr></thead><tbody>';
      i += 2;
      while(i<lines.length && /^\s*\|.+\|\s*$/.test(lines[i])){
        html += '<tr>' + cells(lines[i]).map(c=>`<td>${c}</td>`).join('') + '</tr>'; i++;
      }
      html += '</tbody></table>'; continue;
    }
    if(!line.trim()){ closeList(); closeQuote(); i++; continue; }
    let m;
    if(/^\s*(---+|\*\*\*+)\s*$/.test(line)){ closeList(); closeQuote(); html += '<hr>'; i++; continue; }
    if((m = line.match(/^>\s?(.*)$/))){ closeList(); if(!quote){ quote = true; html += '<blockquote>'; } html += `<p>${mdInline(m[1])}</p>`; i++; continue; }
    closeQuote();
    if((m = line.match(/^(#{1,3})\s+(.*)$/))){ closeList(); const lvl = m[1].length+2; html += `<h${lvl}>${mdInline(m[2])}</h${lvl}>`; i++; continue; }
    if((m = line.match(/^\s*[-*•]\s+(.*)$/))){ if(list!=='ul'){ closeList(); list='ul'; html+='<ul>'; } html += `<li>${mdInline(m[1])}</li>`; i++; continue; }
    if((m = line.match(/^\s*\d+\.\s+(.*)$/))){ if(list!=='ol'){ closeList(); list='ol'; html+='<ol>'; } html += `<li>${mdInline(m[1])}</li>`; i++; continue; }
    closeList(); html += `<p>${mdInline(line)}</p>`; i++;
  }
  closeList(); closeQuote();
  return html;
}

function stripUnsafeSvg(svg){
  return svg.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,'');
}

// Build a themed SVG chart from a spec: {type:'bar'|'line'|'pie', title, labels:[], data:[]}
export function chartSVG(spec){
  try{
    const type = spec.type||'bar';
    const labels = spec.labels||[];
    const data = (spec.data||[]).map(Number);
    if(!data.length) return `<div class="rc-warn">Empty chart.</div>`;
    const W=460, H=260, pad=34, gold='#5EE6D8', sig='#6BA8FF', line='#1C3A52', txt='#7E96AC';
    const max = Math.max(...data, 1), min = Math.min(...data, 0);
    let body = '';
    const title = spec.title ? `<text x="${W/2}" y="18" text-anchor="middle" fill="#E8F1F8" font-size="13" font-family="sans-serif">${escapeHtml(spec.title)}</text>` : '';
    if(type==='pie'){
      const total = data.reduce((a,b)=>a+b,0)||1; let ang=-Math.PI/2; const cx=W/2, cy=H/2+8, r=88;
      const cols=[gold,sig,'#3E7CB1','#C77D5A','#8E7BD6','#5FA572','#D6604D'];
      data.forEach((d,i)=>{
        const a2=ang+(d/total)*Math.PI*2;
        const x1=cx+r*Math.cos(ang), y1=cy+r*Math.sin(ang), x2=cx+r*Math.cos(a2), y2=cy+r*Math.sin(a2);
        const large=(a2-ang)>Math.PI?1:0;
        body+=`<path d="M${cx} ${cy} L${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${cols[i%cols.length]}" opacity="0.85"/>`;
        ang=a2;
      });
      labels.forEach((l,i)=>{ body+=`<rect x="${W-120}" y="${40+i*18}" width="10" height="10" fill="${cols[i%cols.length]}"/><text x="${W-104}" y="${49+i*18}" fill="${txt}" font-size="11" font-family="sans-serif">${escapeHtml(l)}</text>`; });
    } else if(type==='line'){
      const n=data.length, span=max-min||1, plotW=W-pad*2, plotH=H-pad*2;
      const pts=data.map((d,i)=>[pad+(i/(Math.max(n-1,1)))*plotW, H-pad-((d-min)/span)*plotH]);
      body+=`<polyline fill="none" stroke="${gold}" stroke-width="2" points="${pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')}"/>`;
      pts.forEach(p=>body+=`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="${sig}"/>`);
      labels.forEach((l,i)=>{ const x=pad+(i/(Math.max(n-1,1)))*plotW; body+=`<text x="${x.toFixed(1)}" y="${H-12}" text-anchor="middle" fill="${txt}" font-size="10" font-family="sans-serif">${escapeHtml(l)}</text>`; });
    } else {
      const n=data.length, plotW=W-pad*2, plotH=H-pad*2, bw=plotW/n*0.62, gap=plotW/n;
      data.forEach((d,i)=>{
        const h=((d-Math.min(min,0))/(max-Math.min(min,0)||1))*plotH;
        const x=pad+i*gap+(gap-bw)/2, y=H-pad-h;
        body+=`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(h,1).toFixed(1)}" rx="3" fill="${gold}" opacity="0.9"/>`;
        body+=`<text x="${(x+bw/2).toFixed(1)}" y="${y-5}" text-anchor="middle" fill="${txt}" font-size="10" font-family="sans-serif">${d}</text>`;
        if(labels[i]) body+=`<text x="${(x+bw/2).toFixed(1)}" y="${H-12}" text-anchor="middle" fill="${txt}" font-size="10" font-family="sans-serif">${escapeHtml(String(labels[i]).slice(0,10))}</text>`;
      });
    }
    return `<svg class="rc-chart" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><line x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}" stroke="${line}"/>${title}${body}</svg>`;
  }catch(e){ return `<div class="rc-warn">Could not draw that chart.</div>`; }
}

// Lightweight markdown for the streaming view: inline styles + paragraphs only, no
// half-parsed structures. Fenced blocks still streaming show as a shimmer placeholder.
export function renderStreaming(text){
  const fences = text.split('```');
  let out = '';
  for(let i=0;i<fences.length;i++){
    if(i%2===0) out += mdBlock(escapeHtml(fences[i]));
    else out += '<div class="rc rc-pending">building a visual…</div>';
  }
  return out;
}

// Returns { html, mermaid:[ids->code], quiz:[ids->cards] } so caller can finish async/interactive bits.
export function renderRich(text){
  const parts = [];
  const re = /```(\w+)?\n([\s\S]*?)```/g;
  let last = 0, m, idx = 0;
  const mermaid = [], quiz = [];
  while((m = re.exec(text))){
    if(m.index > last) parts.push(mdBlock(escapeHtml(text.slice(last, m.index))));
    const lang = (m[1]||'').toLowerCase(), code = m[2].trim();
    if(lang==='chart' || lang==='axon-chart'){
      try{ parts.push(`<div class="rc">${chartSVG(JSON.parse(code))}</div>`); }
      catch(e){ parts.push(codeBlock(code, lang)); }
    } else if(lang==='svg'){
      parts.push(`<div class="rc">${stripUnsafeSvg(code)}</div>`);
    } else if(lang==='quiz'){
      try{ const cards = JSON.parse(code); const id='quiz_'+Date.now().toString(36)+'_'+(idx++); quiz.push({id, cards}); parts.push(`<div class="rc" id="${id}"></div>`); }
      catch(e){ parts.push(codeBlock(code, lang)); }
    } else if(lang==='mermaid'){
      const id='mmd_'+Date.now().toString(36)+'_'+(idx++); mermaid.push({id, code}); parts.push(`<div class="rc mermaid-host" id="${id}"></div>`);
    } else {
      parts.push(codeBlock(code, lang));
    }
    last = re.lastIndex;
  }
  if(last < text.length) parts.push(mdBlock(escapeHtml(text.slice(last))));
  return { html: parts.join(''), mermaid, quiz };
}

function codeBlock(code, lang){
  return `<div class="rc-codewrap"><div class="rc-codebar"><span>${escapeHtml(lang||'text')}</span><button class="rc-copy" data-copy>copy</button></div><pre class="rc-code">${escapeHtml(code)}</pre></div>`;
}
