// bridge.js — the client for AXON's local organ (bridge.py). Detects whether the
// bridge is running, holds the session token, and exposes the machine tools.
// Mutating calls route through a confirm gate so nothing happens without approval.

let token = null, online = false, info = {};

export function bridgeOnline(){ return online; }
export function bridgeInfo(){ return info; }

export async function probeBridge(){
  try{
    const res = await fetch('/__axon/token', { cache:'no-store' });
    if(!res.ok) throw 0;
    const d = await res.json();
    token = d.token; info = d; online = true;
    return true;
  }catch(e){ online = false; return false; }
}

async function call(name, args){
  if(!online) throw new Error('The bridge is not running. Launch AXON with start-axon, not by opening the file.');
  const res = await fetch('/__axon/tool/' + name, {
    method:'POST',
    headers:{ 'content-type':'application/json', 'x-axon-token': token },
    body: JSON.stringify(args || {})
  });
  const data = await res.json().catch(()=>({ error:'bad response' }));
  if(!res.ok) throw new Error(data.error || ('bridge error ' + res.status));
  return data;
}

// confirm gate: the app sets this; mutating tools await it and only proceed on approve
let confirmer = async ()=>false;
export function setConfirmer(fn){ confirmer = fn; }

const READ_TOOLS = new Set(['roots','add_root','list','read','search']);

// unified entry the agent loop uses. Read tools run free; the rest ask first.
export async function runTool(name, args){
  if(READ_TOOLS.has(name)) return call(name, args);
  const ok = await confirmer(name, args);
  if(!ok) return { error:'You declined this action.' };
  return call(name, { ...args, confirmed:1 });
}

// --- tool catalog handed to the model (Anthropic tool-use schema) ---
export const TOOL_SCHEMAS = [
  { name:'list', description:'List files and folders in a directory under approved roots.',
    input_schema:{ type:'object', properties:{ path:{type:'string', description:'Absolute folder path'} }, required:['path'] } },
  { name:'read', description:'Read a text file under approved roots.',
    input_schema:{ type:'object', properties:{ path:{type:'string'} }, required:['path'] } },
  { name:'search', description:'Search file names and contents for a string under a folder.',
    input_schema:{ type:'object', properties:{ path:{type:'string', description:'Folder to search'}, query:{type:'string'} }, required:['query'] } },
  { name:'write', description:'Create or overwrite a text file. Requires user confirmation.',
    input_schema:{ type:'object', properties:{ path:{type:'string'}, content:{type:'string'} }, required:['path','content'] } },
  { name:'exec', description:'Run a shell command on the user machine. Requires confirmation. Returns stdout, stderr, exit code.',
    input_schema:{ type:'object', properties:{ cmd:{type:'string'}, cwd:{type:'string'} }, required:['cmd'] } },
  { name:'run_code', description:'Write and execute a snippet (python, js, or bash) in a scratch sandbox. Requires confirmation.',
    input_schema:{ type:'object', properties:{ lang:{type:'string', enum:['python','js','bash']}, code:{type:'string'} }, required:['lang','code'] } },
  { name:'open', description:'Open a file, folder, app, or URL with the OS default. Requires confirmation.',
    input_schema:{ type:'object', properties:{ target:{type:'string'} }, required:['target'] } },
];
