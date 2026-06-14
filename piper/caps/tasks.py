"""Capability: tasks — a durable, plain-JSON to-do list Piper can manage for you.

Stored in data/tasks.json (human-readable, survives forever, easy to back up). These
tools touch only Piper's own data, not your system, so they run without confirmation.
"""
import json, os, time

DATA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
FILE = os.path.join(DATA, "tasks.json")

def _load():
    try: return json.load(open(FILE))
    except Exception: return []
def _save(ts):
    os.makedirs(DATA, exist_ok=True); json.dump(ts, open(FILE, "w"), indent=2)

MANIFEST = {
    "name": "tasks",
    "summary": "a personal to-do list Piper keeps for you",
    "tools": [
        {"name": "task_add", "args": ["text", "arc"], "mutating": False,
         "desc": "add a task; optional arc one of RX DN FN MN BD CS"},
        {"name": "task_list", "args": [], "mutating": False, "desc": "list open tasks"},
        {"name": "task_done", "args": ["id"], "mutating": False, "desc": "mark a task done by its id"},
    ],
}

def task_add(args):
    text = (args.get("text") or "").strip()
    if not text: return {"error": "empty task"}
    ts = _load()
    tid = (max([t["id"] for t in ts], default=0) + 1)
    ts.append({"id": tid, "text": text, "arc": (args.get("arc") or "").upper(),
               "done": False, "ts": int(time.time())})
    _save(ts)
    return {"added": tid, "text": text}

def task_list(args):
    return {"open": [{"id": t["id"], "text": t["text"], "arc": t.get("arc", "")}
                     for t in _load() if not t.get("done")]}

def task_done(args):
    tid = args.get("id")
    try: tid = int(tid)
    except Exception: return {"error": "need a numeric id"}
    ts = _load(); hit = False
    for t in ts:
        if t["id"] == tid: t["done"] = True; hit = True
    _save(ts)
    return {"done": tid} if hit else {"error": "no task %s" % tid}
