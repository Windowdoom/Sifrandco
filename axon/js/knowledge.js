// knowledge.js — bulk knowledge intake. Anything you drop in the axon/knowledge
// folder is absorbed into a dedicated "Knowledge" space on launch, chunked for
// recall, and deduped so re-launching does not re-ingest. Needs the bridge.
import { state, S, idbPut, uid, now, spaceColor } from './store.js';
import { chunkText } from './retrieval.js';
import { bridgeOnline, runTool } from './bridge.js';

const SEEN_KEY = 'axon_knowledge_seen';
const TEXT_EXT = /\.(txt|md|markdown|csv|json|tsv|text|org|rst)$/i;

function seen(){ try{ return JSON.parse(localStorage.getItem(SEEN_KEY)||'{}'); }catch(e){ return {}; } }
function saveSeen(s){ localStorage.setItem(SEEN_KEY, JSON.stringify(s)); }

async function ensureSpace(){
  let sp = state.spaces.find(s=>s.name==='Knowledge');
  if(!sp){ sp = { id:uid(), name:'Knowledge', icon:'❖', color:spaceColor(state.spaces.length), createdAt:now() };
    await idbPut('spaces', sp); state.spaces.push(sp); }
  return sp;
}

// Returns a short status string, or null if nothing to do / no bridge.
export async function ingestKnowledgeFolder(onProgress){
  if(!bridgeOnline()) return null;
  let listing;
  try{ listing = await runTool('roots', {}); }catch(e){ return null; }
  const folder = ((listing.home||'') && (window.AXON_KNOWLEDGE_DIR)) || null;
  // knowledge folder sits next to the app; ask the bridge to add+list it
  const dir = await locateKnowledgeDir();
  if(!dir) return null;
  let files;
  try{ files = (await runTool('list', { path:dir })).items || []; }
  catch(e){ return null; }
  const textFiles = files.filter(f=>!f.dir && TEXT_EXT.test(f.name));
  if(!textFiles.length) return null;
  const sp = await ensureSpace();
  const mark = seen();
  let added = 0, fileCount = 0;
  for(const f of textFiles){
    const key = dir + '/' + f.name;
    if(mark[key] === f.mtime) continue;          // unchanged since last ingest
    onProgress && onProgress(`absorbing ${f.name}…`);
    let content;
    try{ content = (await runTool('read', { path:key })).content || ''; }catch(e){ continue; }
    // drop old chunks from this file, then re-ingest
    state.entries = state.entries.filter(e=>!(e.spaceId===sp.id && e.source===f.name));
    const chunks = chunkText(content, 900);
    for(let i=0;i<chunks.length;i++){
      const e = { id:uid(), spaceId:sp.id, title:f.name+(chunks.length>1?' · part '+(i+1):''),
        body:chunks[i], tags:['material','knowledge'], source:f.name, attachments:[], createdAt:now(), updatedAt:now() };
      await idbPut('entries', e); state.entries.push(e); added++;
    }
    mark[key] = f.mtime; fileCount++;
  }
  saveSeen(mark);
  return added ? `Absorbed ${fileCount} file${fileCount===1?'':'s'} into the Knowledge bank (${added} passages).` : null;
}

// Find the knowledge folder by asking the bridge to add the app dir + /knowledge.
async function locateKnowledgeDir(){
  try{
    const r = await runTool('roots', {});
    const cwd = r.cwd; if(!cwd) return null;
    const dir = cwd.replace(/\/$/,'') + '/knowledge';
    await runTool('add_root', { path: dir }).catch(()=>{});
    const probe = await runTool('list', { path: dir }).catch(()=>null);
    return probe && !probe.error ? dir : null;
  }catch(e){ return null; }
}
