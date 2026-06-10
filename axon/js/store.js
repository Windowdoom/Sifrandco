// store.js — persistence. IndexedDB for the growing brain, localStorage for small settings.

const DBN = 'axon_db', DBV = 2;
let _db = null;

export const state = { spaces: [], entries: [], memories: [] };
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
export const now = () => new Date().toISOString();

const SKEY = 'axon_settings';
const DEFS = { engine:'off', apiKey:'', model:'claude-sonnet-4-6', localModel:'Llama-3.2-3B-Instruct-q4f16_1-MLC', speak:true, voiceURI:'', profile:'', activeSpace:null };
export let S = loadS();
function loadS(){ try{ return { ...DEFS, ...JSON.parse(localStorage.getItem(SKEY)||'{}') }; }catch(e){ return { ...DEFS }; } }
export function saveS(){ localStorage.setItem(SKEY, JSON.stringify(S)); }

function openDB(){
  return new Promise((res,rej)=>{
    const r = indexedDB.open(DBN, DBV);
    r.onupgradeneeded = e=>{
      const d = e.target.result;
      if(!d.objectStoreNames.contains('spaces')) d.createObjectStore('spaces',{keyPath:'id'});
      if(!d.objectStoreNames.contains('entries')){ const s=d.createObjectStore('entries',{keyPath:'id'}); s.createIndex('space','spaceId'); }
      if(!d.objectStoreNames.contains('memories')) d.createObjectStore('memories',{keyPath:'id'});
      if(!d.objectStoreNames.contains('chat')){ const c=d.createObjectStore('chat',{keyPath:'id'}); c.createIndex('space','spaceId'); }
    };
    r.onsuccess = ()=>{ _db = r.result; res(_db); };
    r.onerror = ()=>rej(r.error);
  });
}
function tx(store,mode){ return _db.transaction(store,mode).objectStore(store); }
export function idbPut(store,val){ return new Promise((res,rej)=>{ const r=tx(store,'readwrite').put(val); r.onsuccess=()=>res(val); r.onerror=()=>rej(r.error); }); }
export function idbDel(store,key){ return new Promise((res,rej)=>{ const r=tx(store,'readwrite').delete(key); r.onsuccess=()=>res(); r.onerror=()=>rej(r.error); }); }
export function idbAll(store){ return new Promise((res,rej)=>{ const r=tx(store,'readonly').getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error); }); }

export async function refreshMirrors(){
  state.spaces = await idbAll('spaces');
  state.entries = await idbAll('entries');
  state.memories = await idbAll('memories');
}
export function activeSpace(){ return state.spaces.find(s=>s.id===S.activeSpace) || state.spaces[0]; }

const SCOLORS = ['#C9A84C','#3FD0C9','#3E7CB1','#C77D5A','#8E7BD6','#5FA572','#D6604D'];
export function spaceColor(i){ return SCOLORS[i % SCOLORS.length]; }

// What AXON knows about Danial out of the box. A written understanding of how he works
// and where he is headed, so its grasp of him is general, not just fact-by-fact.
const SEED_PROFILE = `Danial is a medical student at American University of Antigua, MD track. He has passed USMLE Step 1 and is in clinical rotations. He is deciding between Emergency Medicine and General Surgery and is aiming for a Step 2 CK score of 245 or higher. He likes procedures, diagnosis, and acute hands-on work.

He thinks in long horizons of ten, twenty-five, and fifty years, and plans his life around faith, family, study, business, and writing together. Long term he wants to settle his family on land with a large home and a sustainable setup. He is the eldest sibling and carries a protector and builder mindset.

He runs a board-prep tutoring business called Bit by Bit Pedagogy, built on discriminator-first reasoning and a four-step framework he calls the Master Pivot: Think Mechanism, Pivot Fast, Trust the Discriminator, Triage the Choices. He writes fiction and Urdu songs and geopolitical and theological essays under the pen name Aryan Abraham.

He is a practicing Sunni Muslim and faith is central to his daily life. He studies Quran and tafsir daily and wants Islamic answers from authentic Sunni sources only.

He values structure, verification, and authentic human-sounding output. He dislikes em dashes, robotic AI phrasing, made-up facts or citations, and tables in documents. For medicine he wants mechanism-first, detailed explanations. Elsewhere he prefers concise, fact-based answers.`;

const SEED_MEMORIES = [
  'Danial is MD track at American University of Antigua. Never confuse MD with DO, or USMLE with COMLEX.',
  'He passed USMLE Step 1 and is in clinical rotations. Do not ask about his Step 1 score.',
  'His specialty interest is between Emergency Medicine and General Surgery. Step 2 CK target is 245 or higher.',
  'He studies medicine discriminator-first using the 4-Step Master Pivot: Think Mechanism, Pivot Fast, Trust the Discriminator, Triage the Choices.',
  'Core study resources he uses: UWorld, AMBOSS, Pathoma, Sketchy, First Aid, Mehlman, Boards and Beyond, NBME forms.',
  'He runs a tutoring business called Bit by Bit Pedagogy.',
  'He writes fiction, Urdu songs, and essays under the pen name Aryan Abraham. Published works include The Undying and The Hollow Ledger.',
  'He is a practicing Sunni Muslim with classical grounding. Islamic answers should use authentic Sunni sources only, no weak hadith unless labeled.',
  'He studies Quran and tafsir daily using classical Sunni sources.',
  'He dislikes em dashes, AI-sounding phrasing, and confabulation. He wants simple, authentic language scaled to the context.',
  'He prefers mechanism-first detailed medical explanations, and concise fact-based answers elsewhere.',
  'He thinks in long horizons and plans family, faith, business, study, and writing as one connected life. He is the eldest sibling with a protector and builder orientation.'
];

async function seedKnowledge(){
  if(localStorage.getItem('axon_seeded_v1')) return;
  if(!S.profile){ S.profile = SEED_PROFILE; saveS(); }
  for(const t of SEED_MEMORIES) await idbPut('memories', { id:uid(), text:t, createdAt:now(), source:'axon' });
  localStorage.setItem('axon_seeded_v1','1');
}

export async function init(){
  await openDB();
  state.spaces = await idbAll('spaces');
  if(!state.spaces.length){
    const defs = [['General','◆'],['Medicine','✚'],['Writing','✎'],['Business','▰'],['Faith','☾'],['Finance','§']];
    for(let i=0;i<defs.length;i++) await idbPut('spaces',{ id:uid(), name:defs[i][0], icon:defs[i][1], color:spaceColor(i), createdAt:now() });
    state.spaces = await idbAll('spaces');
  }
  if(!S.activeSpace){ S.activeSpace = state.spaces[0].id; saveS(); }
  // one-time migration from older single-file versions
  if(!localStorage.getItem('axon_migrated')){
    try{
      const old = JSON.parse(localStorage.getItem('medbrain_v1')||'null');
      if(old){
        const med = state.spaces.find(s=>s.name==='Medicine') || state.spaces[0];
        for(const c of (old.cases||[])) await idbPut('entries',{ id:uid(), spaceId:med.id, title:c.dx||c.cc||'Case', body:[c.presentation,c.mechanism,c.discriminator&&('Discriminator: '+c.discriminator)].filter(Boolean).join('\n'), tags:['case'], attachments:c.attachments||[], createdAt:c.date||now(), updatedAt:now() });
        for(const q of (old.questions||[])) await idbPut('entries',{ id:uid(), spaceId:med.id, title:q.topic||'Question', body:[q.stem,q.discriminator&&('Discriminator: '+q.discriminator)].filter(Boolean).join('\n'), tags:['question'], attachments:[], createdAt:q.createdAt||now(), updatedAt:now() });
      }
    }catch(e){}
    localStorage.setItem('axon_migrated','1');
  }
  await seedKnowledge();
  await refreshMirrors();
}

// chat persistence per space
export async function loadChat(spaceId){
  const all = await idbAll('chat');
  return all.filter(c=>c.spaceId===spaceId).sort((a,b)=>(a.ts||'').localeCompare(b.ts||''));
}
export async function saveChatTurn(spaceId, role, content){
  const turn = { id:uid(), spaceId, role, content, ts:now() };
  await idbPut('chat', turn);
  return turn;
}
