// offline.js — the zero-dependency knowledge engine. Answers what it can with no API
// and no model: math, units, dates, world facts, and recall from the user's own brain.
// Returns a string answer or null so the caller can fall through to a real model.

import { retrieve, relevantMemories, toks } from './retrieval.js';
import { state, S } from './store.js';

/* ---------- safe math ---------- */
// Tokenizing recursive-descent evaluator. No eval, no Function.
export function evalMath(expr){
  const s = expr.replace(/[, ]/g,'')
    .replace(/\^/g,'**').replace(/×|x(?=\d)/gi,'*').replace(/÷/g,'/')
    .replace(/(\d+(?:\.\d+)?)%/g,'($1/100)')
    .replace(/\bpi\b/gi, String(Math.PI)).replace(/\be\b/g, String(Math.E));
  if(!/^[\d.+\-*/()%\s*]+$/.test(s.replace(/\*\*/g,'*'))) return null;
  let i = 0;
  function num(){
    if(s[i]==='('){ i++; const v = addsub(); if(s[i]===')') i++; return v; }
    if(s[i]==='-'){ i++; return -num(); }
    const m = s.slice(i).match(/^\d+(\.\d+)?/); if(!m) return NaN;
    i += m[0].length; return parseFloat(m[0]);
  }
  function pow(){ let v = num(); while(s.startsWith('**', i)){ i+=2; v = v ** pow(); } return v; }
  function muldiv(){ let v = pow(); while(s[i]==='*'||s[i]==='/'||s[i]==='%'){ const op=s[i++]; const r=pow(); v = op==='*'?v*r:op==='/'?v/r:v%r; } return v; }
  function addsub(){ let v = muldiv(); while(s[i]==='+'||s[i]==='-'){ const op=s[i++]; const r=muldiv(); v = op==='+'?v+r:v-r; } return v; }
  try{ const v = addsub(); return (i===s.length && isFinite(v)) ? v : null; }catch(e){ return null; }
}
const fmt = n => {
  if(!isFinite(n)) return String(n);
  const r = Math.round(n*1e8)/1e8;
  return Math.abs(r) >= 1e15 ? r.toExponential(6) : r.toLocaleString('en-US',{maximumFractionDigits:8});
};

/* ---------- units ---------- */
// canonical bases: m, kg, s, m2, m3 (L), C handled specially
const UNITS = {
  km:['len',1000], m:['len',1], cm:['len',.01], mm:['len',.001], mi:['len',1609.344], mile:['len',1609.344], miles:['len',1609.344],
  yd:['len',.9144], yard:['len',.9144], yards:['len',.9144], ft:['len',.3048], foot:['len',.3048], feet:['len',.3048],
  in:['len',.0254], inch:['len',.0254], inches:['len',.0254], nmi:['len',1852],
  kg:['mass',1], g:['mass',.001], mg:['mass',1e-6], lb:['mass',.45359237], lbs:['mass',.45359237], pound:['mass',.45359237], pounds:['mass',.45359237],
  oz:['mass',.0283495], ounce:['mass',.0283495], ounces:['mass',.0283495], stone:['mass',6.35029], ton:['mass',907.185], tonne:['mass',1000],
  l:['vol',1], liter:['vol',1], liters:['vol',1], litre:['vol',1], litres:['vol',1], ml:['vol',.001],
  gal:['vol',3.78541], gallon:['vol',3.78541], gallons:['vol',3.78541], qt:['vol',.946353], quart:['vol',.946353],
  cup:['vol',.2365882], cups:['vol',.2365882], tbsp:['vol',.0147868], tsp:['vol',.00492892], floz:['vol',.0295735],
  s:['time',1], sec:['time',1], second:['time',1], seconds:['time',1], min:['time',60], minute:['time',60], minutes:['time',60],
  h:['time',3600], hr:['time',3600], hour:['time',3600], hours:['time',3600], day:['time',86400], days:['time',86400],
  week:['time',604800], weeks:['time',604800], month:['time',2629800], months:['time',2629800], year:['time',31557600], years:['time',31557600],
  kmh:['spd',1], kph:['spd',1], mph:['spd',1.609344], knots:['spd',1.852], knot:['spd',1.852],
  kb:['data',1e3], mb:['data',1e6], gb:['data',1e9], tb:['data',1e12], kib:['data',1024], mib:['data',1048576], gib:['data',1073741824],
};
export function convertUnits(text){
  let m = text.match(/(-?\d+(?:\.\d+)?)\s*°?\s*(f|c|k|fahrenheit|celsius|kelvin)\b(?:\s*(?:to|in|as)\s*°?\s*(f|c|k|fahrenheit|celsius|kelvin))/i);
  if(m){
    const v = parseFloat(m[1]), from = m[2][0].toLowerCase(), to = m[3][0].toLowerCase();
    const c = from==='c'?v : from==='f'?(v-32)*5/9 : v-273.15;
    const out = to==='c'?c : to==='f'?c*9/5+32 : c+273.15;
    return `${fmt(v)}°${from.toUpperCase()} is ${fmt(out)}°${to.toUpperCase()}.`;
  }
  m = text.match(/(-?\d+(?:\.\d+)?)\s*([a-z°]+)\s*(?:to|in|as|into)\s*([a-z°]+)/i);
  if(!m) return null;
  const v = parseFloat(m[1]);
  const a = UNITS[m[2].toLowerCase()], b = UNITS[m[3].toLowerCase()];
  if(!a || !b || a[0]!==b[0]) return null;
  return `${fmt(v)} ${m[2]} is ${fmt(v*a[1]/b[1])} ${m[3]}.`;
}

/* ---------- dates ---------- */
function dateAnswer(t){
  const today = new Date();
  const fmtD = d => d.toLocaleDateString([], { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  let m = t.match(/(?:how many days|days)\s+(?:until|till|to)\s+(.+?)\??$/);
  if(m){
    const target = new Date(m[1]);
    if(!isNaN(target)){
      if(!/\d{4}/.test(m[1])){
        target.setFullYear(today.getFullYear());
        if(target - today < -864e5) target.setFullYear(today.getFullYear() + 1);
      }
      const days = Math.ceil((target - today) / 864e5);
      return `${days} day${days===1?'':'s'} until ${fmtD(target)}.`;
    }
  }
  m = t.match(/what (?:day|date) (?:is|was|will be) (?:it )?(?:in )?(\d+)\s+(day|week|month|year)s?\s*(ago|from now|from today)?/);
  if(m){
    const n = parseInt(m[1]) * (m[3]==='ago'?-1:1);
    const d = new Date(today);
    if(m[2]==='day') d.setDate(d.getDate()+n);
    if(m[2]==='week') d.setDate(d.getDate()+n*7);
    if(m[2]==='month') d.setMonth(d.getMonth()+n);
    if(m[2]==='year') d.setFullYear(d.getFullYear()+n);
    return `That would be ${fmtD(d)}.`;
  }
  if(/what(?:'s| is)? (?:the )?(?:date|day)( today)?$|today'?s date|^what day is it$/.test(t)) return `Today is ${fmtD(today)}.`;
  if(/what time is it|current time|^the time$/.test(t)) return `It is ${today.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}.`;
  return null;
}

/* ---------- compact world facts ---------- */
const CAPITALS = { 'united states':'Washington, D.C.', usa:'Washington, D.C.', america:'Washington, D.C.', canada:'Ottawa', mexico:'Mexico City', brazil:'Brasília', argentina:'Buenos Aires', uk:'London', 'united kingdom':'London', england:'London', france:'Paris', germany:'Berlin', italy:'Rome', spain:'Madrid', portugal:'Lisbon', netherlands:'Amsterdam', belgium:'Brussels', switzerland:'Bern', austria:'Vienna', greece:'Athens', turkey:'Ankara', russia:'Moscow', ukraine:'Kyiv', poland:'Warsaw', sweden:'Stockholm', norway:'Oslo', denmark:'Copenhagen', finland:'Helsinki', ireland:'Dublin', egypt:'Cairo', 'saudi arabia':'Riyadh', uae:'Abu Dhabi', qatar:'Doha', kuwait:'Kuwait City', jordan:'Amman', lebanon:'Beirut', syria:'Damascus', iraq:'Baghdad', iran:'Tehran', israel:'Jerusalem (disputed)', palestine:'East Jerusalem (claimed); administrative center Ramallah', pakistan:'Islamabad', india:'New Delhi', bangladesh:'Dhaka', 'sri lanka':'Sri Jayawardenepura Kotte', nepal:'Kathmandu', afghanistan:'Kabul', china:'Beijing', japan:'Tokyo', 'south korea':'Seoul', 'north korea':'Pyongyang', indonesia:'Jakarta', malaysia:'Kuala Lumpur', singapore:'Singapore', thailand:'Bangkok', vietnam:'Hanoi', philippines:'Manila', australia:'Canberra', 'new zealand':'Wellington', 'south africa':'Pretoria (executive)', nigeria:'Abuja', kenya:'Nairobi', ethiopia:'Addis Ababa', morocco:'Rabat', algeria:'Algiers', tunisia:'Tunis', ghana:'Accra', colombia:'Bogotá', peru:'Lima', chile:'Santiago', venezuela:'Caracas', cuba:'Havana' };
const ELEMENTS = 'Hydrogen Helium Lithium Beryllium Boron Carbon Nitrogen Oxygen Fluorine Neon Sodium Magnesium Aluminum Silicon Phosphorus Sulfur Chlorine Argon Potassium Calcium Scandium Titanium Vanadium Chromium Manganese Iron Cobalt Nickel Copper Zinc Gallium Germanium Arsenic Selenium Bromine Krypton Rubidium Strontium Yttrium Zirconium'.split(' ');
const ELEM_SYM = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr'.split(' ');
const PLANETS = ['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune'];
const FACTS = [
  [/speed of light/, 'The speed of light in a vacuum is 299,792,458 meters per second, about 186,282 miles per second.'],
  [/how many (continents|oceans)/, t=>/continents/.test(t)?'There are 7 continents: Africa, Antarctica, Asia, Australia, Europe, North America, and South America.':'There are 5 named oceans: Pacific, Atlantic, Indian, Southern, and Arctic.'],
  [/largest ocean/, 'The Pacific Ocean is the largest, covering about a third of Earth\'s surface.'],
  [/longest river/, 'The Nile is traditionally cited as the longest river at about 6,650 km; some measurements put the Amazon slightly ahead.'],
  [/tallest mountain|highest mountain/, 'Mount Everest is the highest above sea level at 8,849 meters (29,032 feet).'],
  [/largest country/, 'Russia is the largest country by area, about 17.1 million square kilometers.'],
  [/most populous country|biggest population/, 'India is the most populous country, having passed China in 2023, each with over 1.4 billion people.'],
  [/how many planets/, 'There are 8 planets in the solar system: ' + PLANETS.join(', ') + '. Pluto was reclassified as a dwarf planet in 2006.'],
  [/largest planet/, 'Jupiter is the largest planet, with more than twice the mass of all other planets combined.'],
  [/closest planet to the sun/, 'Mercury is the closest planet to the Sun.'],
  [/how far .*(moon)/, 'The Moon is on average about 384,400 km (238,855 miles) from Earth.'],
  [/how far .*(sun)/, 'The Sun is on average about 149.6 million km (93 million miles) from Earth, one astronomical unit.'],
  [/boiling point of water/, 'Water boils at 100°C (212°F) at sea level pressure.'],
  [/freezing point of water/, 'Water freezes at 0°C (32°F).'],
  [/human body temperature/, 'Normal human body temperature is about 37°C (98.6°F), with a normal range of roughly 36.1 to 37.2°C.'],
  [/how many bones/, 'An adult human has 206 bones; babies are born with about 270 that fuse over time.'],
  [/pillars of islam/, 'The five pillars of Islam: Shahada (declaration of faith), Salah (prayer), Zakat (charity), Sawm (fasting Ramadan), and Hajj (pilgrimage).'],
  [/how many surahs|chapters in the quran/, 'The Quran has 114 surahs.'],
];
function factAnswer(t){
  let m = t.match(/capital (?:city )?of (?:the )?([a-z .]+?)\??$/);
  if(m){ const c = CAPITALS[m[1].trim()]; if(c) return `The capital of ${m[1].trim().replace(/\b\w/g,ch=>ch.toUpperCase())} is ${c}.`; }
  m = t.match(/(?:atomic number|element)\s+(?:of\s+|number\s+)?(\w+)/);
  if(m){
    const q = m[1].toLowerCase();
    const byName = ELEMENTS.findIndex(e=>e.toLowerCase()===q);
    if(byName>=0) return `${ELEMENTS[byName]} (${ELEM_SYM[byName]}) is element number ${byName+1}.`;
    const n = parseInt(q);
    if(n>=1 && n<=ELEMENTS.length) return `Element ${n} is ${ELEMENTS[n-1]} (${ELEM_SYM[n-1]}).`;
  }
  for(const [re, ans] of FACTS) if(re.test(t)) return typeof ans==='function'?ans(t):ans;
  return null;
}

/* ---------- misc utilities ---------- */
function utilAnswer(t, raw){
  let m = t.match(/roll (?:a |an )?(?:(\d+)\s*)?d(?:ice|ie)?\s*(\d+)?/);
  if(m){ const sides = parseInt(m[2])||6, n = Math.min(parseInt(m[1])||1, 20); const rolls = Array.from({length:n},()=>1+Math.floor(Math.random()*sides)); return n===1?`You rolled a ${rolls[0]}.`:`You rolled ${rolls.join(', ')} — total ${rolls.reduce((a,b)=>a+b)}.`; }
  if(/flip a coin|coin flip|heads or tails/.test(t)) return Math.random()<.5?'Heads.':'Tails.';
  m = t.match(/(?:pick|random) (?:a )?number (?:between|from) (\d+) (?:and|to) (\d+)/);
  if(m){ const a=parseInt(m[1]), b=parseInt(m[2]); return `${Math.min(a,b)+Math.floor(Math.random()*(Math.abs(b-a)+1))}.`; }
  m = t.match(/(\d+(?:\.\d+)?)\s*(?:%|percent) of (\d+(?:[,.]\d+)?)/);
  if(m) return `${m[1]}% of ${m[2]} is ${fmt(parseFloat(m[1])/100*parseFloat(m[2].replace(/,/g,'')))}.`;
  m = t.match(/(\d+(?:\.\d+)?)\s+is what (?:%|percent) of (\d+(?:\.\d+)?)/);
  if(m) return `${m[1]} is ${fmt(parseFloat(m[1])/parseFloat(m[2])*100)}% of ${m[2]}.`;
  m = t.match(/(?:tip|how much .*tip).*?(\d+(?:\.\d+)?).*?(\d+)\s*(?:%|percent)|(\d+)\s*(?:%|percent) tip on \$?(\d+(?:\.\d+)?)/);
  if(m){ const bill = parseFloat(m[1]||m[4]), pct = parseFloat(m[2]||m[3]); if(bill&&pct) return `A ${pct}% tip on $${fmt(bill)} is $${fmt(bill*pct/100)}, for a total of $${fmt(bill*(1+pct/100))}.`; }
  m = raw.match(/spell (?:the word )?["']?([a-zA-Z-]+)["']?/i);
  if(m) return `${m[1]}: ${m[1].toUpperCase().split('').join(' · ')}.`;
  m = t.match(/square root of (\d+(?:\.\d+)?)/);
  if(m) return `The square root of ${m[1]} is ${fmt(Math.sqrt(parseFloat(m[1])))}.`;
  m = t.match(/(\d{1,3})\s*(?:factorial|!)\s*$/);
  if(m){ let n=parseInt(m[1]); if(n<=170){ let v=1; for(let i=2;i<=n;i++) v*=i; return `${n}! is ${v>1e15?v.toExponential(6):fmt(v)}.`; } }
  return null;
}

/* ---------- recall from the user's own brain ---------- */
function recallAnswer(question){
  const notes = retrieve(question, state.entries, S.activeSpace, 3);
  const mems = relevantMemories(question, state.memories, 3).filter(m=>{
    const q = new Set(toks(question)), mt = new Set(toks(m.text));
    let hits = 0; q.forEach(w=>{ if(mt.has(w)) hits++; });
    return hits >= 2 || (hits >= 1 && q.size <= 3);
  });
  if(!notes.length && !mems.length) return null;
  let out = 'No model is on, but here is what I recall from your own brain:\n';
  for(const m of mems) out += `\n- (memory) ${m.text}`;
  for(const n of notes) out += `\n- **${n.title}** — ${(n.body||'').slice(0,300)}${(n.body||'').length>300?'…':''}`;
  out += '\n\nFor a reasoned answer, switch a brain on in Settings.';
  return out;
}

// Main entry. Returns { text, source } or null.
export function offlineAnswer(raw, { recallFallback = false } = {}){
  const t = raw.toLowerCase().trim().replace(/[?!.]+$/,'');
  const mathish = raw.replace(/^(what is|what's|calculate|compute|how much is|solve)\s+/i,'').trim();
  if(/^[\d\s.+\-*/()^%×÷,]+$/.test(mathish) && /\d/.test(mathish) && /[+\-*/^×÷%]/.test(mathish)){
    const v = evalMath(mathish);
    if(v!==null) return { text:`${mathish.trim()} = **${fmt(v)}**`, source:'math' };
  }
  for(const [fn, src] of [[convertUnits,'units'],[dateAnswer,'dates'],[factAnswer,'facts'],[s=>utilAnswer(s, raw),'utility']]){
    const a = fn(t);
    if(a) return { text:a, source:src };
  }
  if(recallFallback){
    const r = recallAnswer(raw);
    if(r) return { text:r, source:'recall' };
  }
  return null;
}
