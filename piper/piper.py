#!/usr/bin/env python3
"""
PIPER — a cohesive, portable personal AI. The Piper model on any system.

One file, pure Python standard library. No Flask, no pip installs. It serves the
صفر shell and runs the full Piper reasoning loop: persona + long-term memory +
retrieval over your own library + temporal/faith awareness, streamed from a local
model (Ollama), a Claude API amplifier when you want it, or a deterministic
offline floor so it is never dead.

Run:   python3 piper.py        (then open the address it prints)
Stop:  Control-C

Brains, in priority order (auto-detected each turn):
  1. Ollama at 127.0.0.1:11434  — local, private, free   (the home brain)
  2. Claude API, if a key is set — strongest reasoning     (the amplifier)
  3. Offline engine              — math, dates, units, recall (always works)

Everything lives next to this file. Nothing leaves the machine unless you set an
API key and a turn routes to it.
"""
import http.server, socketserver, json, os, sys, re, time, math, sqlite3, struct
import urllib.request, urllib.parse, threading, platform, hashlib
from datetime import datetime, timezone, timedelta
try:
    from zoneinfo import ZoneInfo
except Exception:
    ZoneInfo = None

ROOT = os.path.dirname(os.path.abspath(__file__))
SHELL = os.path.join(ROOT, "shell")
KNOWLEDGE = os.path.join(ROOT, "knowledge")
DATA = os.path.join(ROOT, "data")
os.makedirs(DATA, exist_ok=True)
os.makedirs(KNOWLEDGE, exist_ok=True)

# ---------------------------------------------------------------- config
DEFAULTS = {
    "port": 7777,
    "ollama": "http://127.0.0.1:11434",
    "model": "qwen2.5:3b",            # the local brain; pull with: ollama pull qwen2.5:3b
    "voice_model": "",                 # optional smaller/faster model for spoken turns
    "embed_model": "nomic-embed-text", # optional; memory falls back to term-match without it
    "claude_key": "",                  # set to use the Claude amplifier
    "claude_model": "claude-sonnet-4-6",
    "owner": "Prime",
    "city": "Kenner",
    "tz": "America/Chicago",
    "lat": 29.9941, "lon": -90.2417,
    "fajr_angle": 18.0, "isha_angle": 17.0, "asr_factor": 1,  # 1 Shafi'i, 2 Hanafi
}
def load_conf():
    c = dict(DEFAULTS)
    p = os.path.join(ROOT, "piper.conf")
    if os.path.exists(p):
        try: c.update(json.load(open(p)))
        except Exception: pass
    # env overrides for the API key, so it need not be written to disk
    c["claude_key"] = os.environ.get("PIPER_CLAUDE_KEY", c["claude_key"])
    if os.environ.get("PIPER_PORT"): c["port"] = int(os.environ["PIPER_PORT"])
    if os.environ.get("PIPER_MODEL"): c["model"] = os.environ["PIPER_MODEL"]
    return c
CONF = load_conf()

def tzinfo():
    if ZoneInfo:
        try: return ZoneInfo(CONF["tz"])
        except Exception: pass
    return timezone.utc
def now_local(): return datetime.now(tzinfo())

# ---------------------------------------------------------------- persona
def persona(voice=False):
    p = os.path.join(ROOT, "persona.txt")
    try:
        text = open(p, encoding="utf-8").read().strip()
    except Exception:
        text = ("You are Piper, the voice of SifarOS and %s's outer mind: composed, loyal, "
                "brief, exact, dry wit when it fits, warm through attention not performance. "
                "Reverent on faith, precise on medicine. No fluff, no em dashes." % CONF["owner"])
    if voice:
        text += ("\n\nThis reply will be SPOKEN aloud. One or two sentences. No lists, no "
                 "markdown, no headings. Speak it the way a person would.")
    return text

ARCS = ("%s's life runs on the Six Arcs across 2026 to 2035: RX (Medicine), DN (Deen), "
        "FN (Finance), MN (Mind), BD (Body), CS (Cosmos). When it sharpens things, place "
        "what he raises in its arc and connect it to the others." % CONF["owner"])
DEPTH = ("Reason before you answer anything that deserves it: weigh what you know of him, what "
         "his library says, and what he is actually asking, then speak. Hold the thread across "
         "turns. A quick question gets a quick answer; a real one earns real thought. When it "
         "genuinely helps, close with the single most useful next step or one sharp question. "
         "Never filler, never a summary of yourself.")

# ---------------------------------------------------------------- memory (SQLite)
MEM_DB = os.path.join(DATA, "memory.db")
HALFLIFE_DAYS = 45.0
IMPORTANCE = {"correction":1.0,"preference":0.9,"relationship":0.9,"win":0.8,
              "fact":0.7,"conversation":0.4,"query":0.2}

def _memdb():
    c = sqlite3.connect(MEM_DB)
    c.execute("CREATE TABLE IF NOT EXISTS mem(id INTEGER PRIMARY KEY, ts INTEGER, kind TEXT, "
              "text TEXT, importance REAL, emb BLOB)")
    return c

def _embed(text):
    if not CONF["embed_model"]: return None
    try:
        req = urllib.request.Request(CONF["ollama"]+"/api/embeddings",
              data=json.dumps({"model":CONF["embed_model"],"prompt":text}).encode(),
              headers={"Content-Type":"application/json"})
        v = json.load(urllib.request.urlopen(req, timeout=8)).get("embedding")
        return struct.pack("%sf"%len(v), *v) if v else None
    except Exception:
        return None
def _unpack(b): return list(struct.unpack("%sf"%(len(b)//4), b)) if b else []
def _cos(a,b):
    if not a or not b or len(a)!=len(b): return 0.0
    d=sum(x*y for x,y in zip(a,b)); na=math.sqrt(sum(x*x for x in a)); nb=math.sqrt(sum(x*x for x in b))
    return d/(na*nb) if na and nb else 0.0

def mem_add(text, kind="fact", importance=None):
    text=(text or "").strip()
    if not text: return
    imp = importance if importance is not None else IMPORTANCE.get(kind,0.5)
    emb = None if kind=="query" else _embed(text)   # query logs use cheap term-match, skip the embed call
    c=_memdb(); c.execute("INSERT INTO mem(ts,kind,text,importance,emb) VALUES(?,?,?,?,?)",
        (int(time.time()),kind,text,imp,emb)); c.commit(); c.close()

def mem_recall(query, n=4, floor=0.14):
    qv=_unpack(_embed(query))
    terms=[w for w in re.findall(r"\w{3,}",(query or "").lower())]
    now=time.time(); c=_memdb()
    try: rows=c.execute("SELECT ts,kind,text,importance,emb FROM mem").fetchall()
    except Exception: rows=[]
    c.close()
    scored=[]
    for ts,kind,text,imp,emb in rows:
        if qv and emb: rel=_cos(qv,_unpack(emb))
        else:
            low=text.lower(); rel=min(1.0,sum(low.count(t) for t in terms)/4.0) if terms else 0.0
        decay=math.exp(-((now-ts)/86400.0)/HALFLIFE_DAYS)
        scored.append((rel*(0.5+imp)*decay, kind, text))
    scored.sort(key=lambda x:-x[0])
    return [{"kind":k,"text":t} for s,k,t in scored[:n] if s>floor]

def mem_forget(query):
    c=_memdb(); ql=(query or "").lower().strip(); ids=[]
    for i,t in c.execute("SELECT id,text FROM mem").fetchall():
        if ql and ql in t.lower(): ids.append(i)
    for i in ids: c.execute("DELETE FROM mem WHERE id=?", (i,))
    c.commit(); c.close(); return len(ids)

def mem_all():
    c=_memdb()
    try: rows=c.execute("SELECT kind,text,ts FROM mem WHERE kind!='query' ORDER BY ts DESC").fetchall()
    except Exception: rows=[]
    c.close(); return [{"kind":k,"text":t,"ts":ts} for k,t,ts in rows]

def capture(query, reply):
    q=query.lower()
    m=re.match(r"(?:remember|note|keep in mind)(?: that| this)?\s+(.+)", q)
    if m: mem_add(m.group(1).strip(),"fact"); return
    if re.search(r"\bi (prefer|like|love|hate|always|never|want)\b", q): mem_add(query.strip(),"preference")
    elif re.search(r"\bmy (brother|sister|mother|father|mom|dad|wife|son|daughter|friend|student|teacher|family|name is)\b|\bis my\b", q):
        mem_add(query.strip(),"relationship")

# ---------------------------------------------------------------- recall (FTS5 over the library)
FTS = os.path.join(DATA, "knowledge.fts")
MANIFEST = os.path.join(DATA, "knowledge.manifest.json")
_STOP={"the","and","for","with","that","this","what","you","your","are","was","from","have",
       "has","his","her","him","she","they","them","but","not","can","will","how","why","who",
       "when","where","which","about","into","out","tell","give","show","does","did","would"}

def _kind_of(name):
    n=name.lower()
    if re.search(r"islam|quran|qur'an|deen|dua|hijjah|hadith|tafsir|salah|iman|kitab", n): return "islamic"
    if re.search(r"journal|personal|profile|codex|arcbook|companion|weekly plan|master plan|life plan|loophole|\bdanial\b", n): return "personal"
    return "reference"

def _chunk(t, size=900):
    t=re.sub(r"\s+"," ",(t or "")).strip()
    if not t: return []
    parts=re.split(r"(?<=[.!?])\s+", t); out=[]; cur=""
    for p in parts:
        if len(cur)+len(p)+1>size:
            if cur: out.append(cur.strip())
            cur=p
        else: cur+=" "+p
    if cur.strip(): out.append(cur.strip())
    return out or [t]

def build_index(force=False):
    """Build/refresh the FTS index from knowledge/*.txt|.md. Cheap: only when files change."""
    files={}
    for fn in sorted(os.listdir(KNOWLEDGE)):
        fp=os.path.join(KNOWLEDGE, fn)
        if os.path.isfile(fp) and re.search(r"\.(txt|md|markdown|csv|text)$", fn, re.I) and fn.lower()!="readme.txt":
            files[fn]=int(os.path.getmtime(fp))
    old={}
    try: old=json.load(open(MANIFEST))
    except Exception: pass
    if not force and files==old and os.path.exists(FTS):
        return -1  # unchanged
    if os.path.exists(FTS): os.remove(FTS)
    c=sqlite3.connect(FTS)
    c.execute("CREATE VIRTUAL TABLE chunks USING fts5(ref, kind, text, tokenize='porter unicode61')")
    n=0; batch=[]
    for fn,mt in files.items():
        kind=_kind_of(fn)
        try: text=open(os.path.join(KNOWLEDGE,fn), encoding="utf-8", errors="ignore").read()
        except Exception: continue
        chunks=_chunk(text)
        for i,ch in enumerate(chunks):
            ref=fn+(" ·%d"%(i+1) if len(chunks)>1 else "")
            batch.append((ref,kind,ch))
            if len(batch)>=2000:
                c.executemany("INSERT INTO chunks(ref,kind,text) VALUES(?,?,?)", batch); n+=len(batch); batch=[]
    if batch: c.executemany("INSERT INTO chunks(ref,kind,text) VALUES(?,?,?)", batch); n+=len(batch)
    c.commit()
    try: c.execute("INSERT INTO chunks(chunks) VALUES('optimize')"); c.commit()
    except Exception: pass
    c.close()
    json.dump(files, open(MANIFEST,"w"))
    return n

def _fts_query(text):
    terms=[t for t in re.findall(r"[a-z0-9]{3,}",(text or "").lower()) if t not in _STOP]
    seen,out=set(),[]
    for t in terms:
        if t not in seen: seen.add(t); out.append('"%s"'%t)
        if len(out)>=12: break
    return " OR ".join(out)

def recall_search(query, n=3, excerpt_chars=300):
    if not os.path.exists(FTS): return []
    q=_fts_query(query)
    if not q: return []
    try:
        c=sqlite3.connect("file:%s?mode=ro"%FTS, uri=True)
        rows=c.execute("SELECT ref, kind, snippet(chunks,2,'','',' … ',40) FROM chunks "
            "WHERE chunks MATCH ? ORDER BY bm25(chunks)*(CASE kind WHEN 'personal' THEN 1.4 "
            "WHEN 'islamic' THEN 1.2 ELSE 1.0 END) LIMIT ?", (q,n)).fetchall()
        c.close()
    except Exception:
        return []
    return [{"ref":r or "","kind":k or "","text":re.sub(r"\s+"," ",(t or "")).strip()[:excerpt_chars]} for r,k,t in rows]

# ---------------------------------------------------------------- awareness (time, prayer, hijri)
def _greg_to_hijri(y,m,d):
    # tabular civil Islamic calendar (Kuwaiti algorithm)
    if (y>1582) or (y==1582 and (m>10 or (m==10 and d>14))):
        a=(y+4800+(m-14)//12)
        jd=(1461*a)//4 + (367*(m-2-12*((m-14)//12)))//12 - (3*((a+100)//100))//4 + d - 32075
    else:
        jd=367*y - (7*(y+5001+(m-9)//7))//4 + (275*m)//9 + d + 1729777
    l=jd-1948440+10632; nn=(l-1)//10631; l=l-10631*nn+354
    j=((10985-l)//5316)*((50*l)//17719)+(l//5670)*((43*l)//15238)
    l=l-((30-j)//15)*((17719*j)//50)-(j//16)*((15238*j)//43)+29
    mm=(24*l)//709; dd=l-(709*mm)//24; yy=30*nn+j-30
    months=["Muharram","Safar","Rabi al-Awwal","Rabi al-Thani","Jumada al-Awwal",
            "Jumada al-Thani","Rajab","Shaban","Ramadan","Shawwal","Dhul-Qadah","Dhul-Hijjah"]
    return "%d %s %d AH" % (dd, months[(mm-1)%12], yy)

def _sun(jd):
    d=jd-2451545.0
    g=math.radians((357.529+0.98560028*d)%360)
    q=(280.459+0.98564736*d)%360
    L=math.radians((q+1.915*math.sin(g)+0.020*math.sin(2*g))%360)
    e=math.radians(23.439-0.00000036*d)
    RA=math.degrees(math.atan2(math.cos(e)*math.sin(L), math.cos(L)))/15.0
    decl=math.degrees(math.asin(math.sin(e)*math.sin(L)))
    EqT=q/15.0 - (RA%24)
    if EqT>12: EqT-=24
    if EqT<-12: EqT+=24
    return decl, EqT

def _prayer_times(dt):
    lat=CONF["lat"]; lon=CONF["lon"]
    off=dt.utcoffset().total_seconds()/3600.0 if dt.utcoffset() else 0.0
    y,m,d=dt.year,dt.month,dt.day
    if m<=2: y-=1; m+=12
    a=y//100; b=2-a+a//4
    jd=math.floor(365.25*(y+4716))+math.floor(30.6001*(m+1))+d+b-1524.5
    decl,EqT=_sun(jd)
    latr=math.radians(lat); dr=math.radians(decl)
    def T(angle):
        try:
            x=(-math.sin(math.radians(angle))-math.sin(latr)*math.sin(dr))/(math.cos(latr)*math.cos(dr))
            return math.degrees(math.acos(max(-1,min(1,x))))/15.0
        except Exception: return 0.0
    def asrT(factor):
        alt=math.degrees(math.atan(1.0/(factor+math.tan(abs(latr-dr)))))
        x=(math.sin(math.radians(alt))-math.sin(latr)*math.sin(dr))/(math.cos(latr)*math.cos(dr))
        return math.degrees(math.acos(max(-1,min(1,x))))/15.0
    dhuhr=12+off-lon/15.0-EqT
    times={"Fajr":dhuhr-T(CONF["fajr_angle"]), "Sunrise":dhuhr-T(0.833), "Dhuhr":dhuhr,
           "Asr":dhuhr+asrT(CONF["asr_factor"]), "Maghrib":dhuhr+T(0.833), "Isha":dhuhr+T(CONF["isha_angle"])}
    return times

def _fmt_hm(h):
    h=h%24; hh=int(h); mm=int(round((h-hh)*60))
    if mm==60: hh=(hh+1)%24; mm=0
    ap="AM" if hh<12 else "PM"; h12=hh%12 or 12
    return "%d:%02d %s"%(h12,mm,ap)

def next_prayer(dt):
    t=_prayer_times(dt); cur=dt.hour+dt.minute/60.0+dt.second/3600.0
    order=["Fajr","Dhuhr","Asr","Maghrib","Isha"]
    for name in order:
        if t[name]>cur:
            mins=int((t[name]-cur)*60)
            return {"name":name,"at":_fmt_hm(t[name]),"countdown":("%dh %dm"%(mins//60,mins%60)) if mins>=60 else ("%dm"%mins)}
    mins=int((24-cur+t["Fajr"])*60)
    return {"name":"Fajr","at":_fmt_hm(t["Fajr"]),"countdown":("%dh %dm"%(mins//60,mins%60))}

def _part_of_day(h):
    return ("the depth of night" if h<5 else "before dawn" if h<7 else "morning" if h<12 else
            "early afternoon" if h<15 else "afternoon" if h<17 else "evening" if h<20 else "night")

def awareness():
    dt=now_local(); part=_part_of_day(dt.hour)
    line="It is %s, %s in %s. %s." % (dt.strftime("%A %-I:%M %p") if os.name!="nt" else dt.strftime("%A %I:%M %p"),
                                      part, CONF["city"], _greg_to_hijri(dt.year,dt.month,dt.day))
    try:
        np=next_prayer(dt)
        if np: line+=" Next prayer is %s in %s."%(np["name"], np["countdown"])
    except Exception: pass
    line+=(" Let the hour shape your presence: unhurried near fajr and late at night, brisk by day. "
           "Do not announce the time unless it matters.")
    return line

def ambient_line():
    dt=now_local()
    try:
        np=next_prayer(dt)
        return "%s · %s in %s" % (dt.strftime("%-I:%M %p").lower() if os.name!="nt" else dt.strftime("%I:%M %p").lower(),
                                  np["name"].lower(), np["countdown"])
    except Exception:
        return dt.strftime("%-I:%M %p").lower() if os.name!="nt" else dt.strftime("%I:%M %p").lower()

# ---------------------------------------------------------------- offline engine (the floor)
def _fmt_num(n):
    if not math.isfinite(n): return str(n)
    r=round(n,8)
    return ("%d"%r) if r==int(r) else ("{:,}".format(r) if abs(r)<1e15 else "%.6e"%r)
def offline_answer(q):
    t=q.lower().strip().rstrip("?!.")
    expr=re.sub(r"^(what is|what's|calculate|compute|how much is|solve)\s+","",q,flags=re.I).strip()
    if re.match(r"^[\d\s.+\-*/()^%]+$", expr.replace("x","*")) and re.search(r"\d",expr) and re.search(r"[+\-*/^%]",expr):
        try:
            v=eval(expr.replace("^","**"), {"__builtins__":{}}, {})
            if isinstance(v,(int,float)) and math.isfinite(v): return "%s = %s"%(expr, _fmt_num(v))
        except Exception: pass
    m=re.search(r"capital of (?:the )?([a-z ]+)", t)
    CAPS={"france":"Paris","japan":"Tokyo","pakistan":"Islamabad","egypt":"Cairo","saudi arabia":"Riyadh",
          "united states":"Washington, D.C.","usa":"Washington, D.C.","india":"New Delhi","turkey":"Ankara"}
    if m and m.group(1).strip() in CAPS: return "The capital of %s is %s."%(m.group(1).strip().title(), CAPS[m.group(1).strip()])
    if re.search(r"what('?s| is)?( the)? (day|date|time)|today'?s date|what day is it|time is it", t):
        return awareness().split(". Let")[0]+"."
    return None

# ---------------------------------------------------------------- model clients
def ollama_up():
    try:
        urllib.request.urlopen(CONF["ollama"]+"/api/tags", timeout=1.2); return True
    except Exception: return False

def ollama_stream(messages, model):
    body=json.dumps({"model":model,"messages":messages,"stream":True,"keep_alive":"10m",
                     "options":{"num_ctx":4096}}).encode()
    req=urllib.request.Request(CONF["ollama"]+"/api/chat", data=body, headers={"Content-Type":"application/json"})
    with urllib.request.urlopen(req, timeout=300) as r:
        for line in r:
            line=line.strip()
            if not line: continue
            try: obj=json.loads(line)
            except Exception: continue
            tok=(obj.get("message") or {}).get("content","")
            if tok: yield tok
            if obj.get("done"): break

def claude_stream(messages, system, model, key):
    payload={"model":model,"max_tokens":1800,"system":system,"messages":messages,"stream":True}
    req=urllib.request.Request("https://api.anthropic.com/v1/messages", data=json.dumps(payload).encode(),
        headers={"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"})
    with urllib.request.urlopen(req, timeout=120) as r:
        for raw in r:
            raw=raw.decode("utf-8","ignore").strip()
            if not raw.startswith("data:"): continue
            data=raw[5:].strip()
            if data=="[DONE]": continue
            try: ev=json.loads(data)
            except Exception: continue
            if ev.get("type")=="content_block_delta" and ev.get("delta",{}).get("type")=="text_delta":
                yield ev["delta"].get("text","")

# ---------------------------------------------------------------- the reasoning loop
_recent=[]; _MAX=8
_TRIVIAL=re.compile(r"^(hi|hey+|hello|yo|sup|salaam|salam|assalam\w*|as-?salam\w*|good\s*(morning|"
    r"evening|night|afternoon)|how\s*are\s*you|how's\s*it|thanks|thank\s*you|ok|okay|cool|nice|"
    r"hmm+|test|you\s*there|wake\s*up)\b", re.I)
def _trivial(q): q=q.strip(); return bool(_TRIVIAL.match(q)) or len(q.split())<=2

def system_prompt(query, voice):
    if _trivial(query):
        p=("You are Piper, the voice of SifarOS and %s's outer mind: composed, loyal, brief, "
           "dry wit when it fits, warm through attention not performance. No fluff, no em dashes. "
           "A sentence is enough." % CONF["owner"])
        try: p+=" "+awareness()
        except Exception: pass
        return p
    parts=[persona(voice), ARCS, DEPTH]
    try: parts.append(awareness())
    except Exception: pass
    mem=mem_recall(query,3)
    if mem: parts.append("What you remember about %s (weave in naturally, never say you are "
                         "recalling): "%CONF["owner"] + " | ".join(m["text"] for m in mem))
    refs=recall_search(query,2,240)
    if refs:
        body="\n".join("[%s] %s"%(r["ref"],r["text"]) for r in refs)
        parts.append("From his library. Ground your answer in this. When you use a source, name it "
                     "in brackets. If it does not answer the question, say so plainly rather than "
                     "inventing:\n"+body)
    return "\n\n".join(parts)

def brain_ask(query, history=None, voice=False):
    """Generator yielding reply tokens. Picks the best available brain each turn."""
    query=(query or "").strip()
    if not query: return

    # explicit commands answer instantly and reliably in every brain mode
    m=re.match(r"(?:remember|note|keep in mind)(?: that| this)?[:,]?\s+(.+)", query, re.I)
    if m:
        mem_add(m.group(1).strip(), "fact")
        yield "Kept. I will remember that "+m.group(1).strip(); return
    m=re.match(r"forget\s+(.+)", query, re.I)
    if m:
        n=mem_forget(m.group(1).strip())
        yield ("Forgotten." if n else "I had nothing matching that."); return
    if re.search(r"what do you (know|remember) about me|what have i told you", query.lower()):
        ms=mem_all()
        yield ("I am holding %d things about you. Recent: %s"%(len(ms), "; ".join(x["text"] for x in ms[:3]))) if ms else "Nothing yet. Teach me with 'remember that'."; return

    try: mem_add(query[:160], "query")
    except Exception: pass

    sys_p=system_prompt(query, voice)
    messages=[]
    for turn in (history or _recent)[-_MAX:]:
        if turn.get("user"): messages.append({"role":"user","content":turn["user"]})
        if turn.get("piper"): messages.append({"role":"assistant","content":turn["piper"]})
    messages.append({"role":"user","content":query})

    full=[]
    try:
        if ollama_up():
            model=CONF["voice_model"] if (voice and CONF["voice_model"]) else CONF["model"]
            for tok in ollama_stream([{"role":"system","content":sys_p}]+messages, model):
                full.append(tok); yield tok
        elif CONF["claude_key"]:
            for tok in claude_stream(messages, sys_p, CONF["claude_model"], CONF["claude_key"]):
                full.append(tok); yield tok
        else:
            off=offline_answer(query)
            msg = off or ("No brain is reachable. Start Ollama (ollama serve) and pull a model, or set "
                          "a Claude key in piper.conf. I can still do math, dates, and recall offline.")
            full.append(msg); yield msg
    except Exception as e:
        off=offline_answer(query)
        if off: full.append(off); yield off
        else: yield "\n[the mind is unreachable: %s]"%e
        return

    reply="".join(full).strip()
    _recent.append({"user":query,"piper":reply})
    if len(_recent)>_MAX*2: del _recent[:len(_recent)-_MAX]
    try: capture(query, reply)
    except Exception: pass

# ---------------------------------------------------------------- HTTP server
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**k): super().__init__(*a, directory=SHELL, **k)
    def log_message(self,*a): pass
    def end_headers(self):
        self.send_header("Cache-Control","no-cache, must-revalidate"); super().end_headers()
    def _json(self,code,obj):
        b=json.dumps(obj).encode(); self.send_response(code)
        self.send_header("Content-Type","application/json"); self.send_header("Content-Length",str(len(b)))
        self.end_headers(); self.wfile.write(b)
    def do_GET(self):
        if self.path.startswith("/status"): return self._json(200,{"initialized":True,"locked":False,
            "brain":("ollama" if ollama_up() else "claude" if CONF["claude_key"] else "offline")})
        if self.path.startswith("/state"): return self._json(200,{"ambient":ambient_line(),"time":ambient_line()})
        if self.path.startswith("/memory"):
            return self._json(200,{"memories":mem_all()[:200]})
        if self.path=="/" or self.path=="": self.path="/index.html"
        return super().do_GET()
    def do_POST(self):
        n=int(self.headers.get("Content-Length",0) or 0)
        try: payload=json.loads(self.rfile.read(n) or b"{}")
        except Exception: payload={}
        if self.path.startswith("/unlock"):
            return self._json(200,{"ok":True})  # open mode: no passphrase wall on portable build
        if self.path.startswith("/forget"):
            return self._json(200,{"removed":mem_forget(payload.get("text",""))})
        if self.path.startswith("/ask"):
            return self._stream_ask(payload)
        return self._json(404,{"error":"no such endpoint"})
    def _stream_ask(self, payload):
        self.close_connection = True          # SSE then close, so clients get EOF
        self.send_response(200)
        self.send_header("Content-Type","text/event-stream")
        self.send_header("Cache-Control","no-cache"); self.send_header("Connection","close")
        self.end_headers()
        try:
            for tok in brain_ask(payload.get("text",""), payload.get("history"), bool(payload.get("voice"))):
                self.wfile.write(("data: "+json.dumps({"t":tok})+"\n\n").encode()); self.wfile.flush()
            self.wfile.write(b"data: {\"done\":true}\n\n"); self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            pass
        except Exception as e:
            try: self.wfile.write(("data: "+json.dumps({"t":"\n[error: %s]"%e})+"\n\n").encode())
            except Exception: pass

class Threading(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads=True

def main():
    os.chdir(ROOT)
    n=build_index()
    if n>=0: print("  indexed %d passages from your library"%n)
    port=CONF["port"]; httpd=None
    for _ in range(10):
        try: httpd=Threading(("127.0.0.1",port),H); break
        except OSError: port+=1
    if not httpd: print("  no free port found."); return
    url="http://localhost:%d/"%port
    brain="Ollama (%s)"%CONF["model"] if ollama_up() else ("Claude (%s)"%CONF["claude_model"] if CONF["claude_key"] else "offline only — start Ollama for full reasoning")
    print("\n  PIPER is live.  %s"%url)
    print("  Brain: %s"%brain)
    print("  Drop textbooks in ./knowledge to deepen it. Control-C to stop.\n")
    try:
        import webbrowser; threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    except Exception: pass
    try: httpd.serve_forever()
    except KeyboardInterrupt: print("\n  Piper stopped.")

if __name__=="__main__":
    main()
