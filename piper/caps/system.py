"""Capability: system — Piper's hands on the machine it runs on.

The seed of the home-server / "control everything" arc. Read tools (info, disk,
processes, file read/search) run freely. Mutating tools (run a command, write a
file) only run when allow_actions is true in piper.conf, and every one is logged
to data/actions.log. This is the owner's deliberate opt-in.
"""
import os, re, shutil, subprocess, platform, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOME = os.path.expanduser("~")
ACTLOG = os.path.join(ROOT, "data", "actions.log")

MANIFEST = {
    "name": "system",
    "summary": "inspect and (when allowed) act on this machine",
    "tools": [
        {"name": "host_info", "args": [], "mutating": False, "desc": "OS, CPU count, uptime, load"},
        {"name": "disk", "args": [], "mutating": False, "desc": "disk usage of the home volume"},
        {"name": "processes", "args": [], "mutating": False, "desc": "top processes by memory"},
        {"name": "list_dir", "args": ["path"], "mutating": False, "desc": "list a folder under home"},
        {"name": "read_file", "args": ["path"], "mutating": False, "desc": "read a text file under home"},
        {"name": "run_command", "args": ["cmd"], "mutating": True, "desc": "run a shell command (allow_actions only)"},
        {"name": "write_file", "args": ["path", "content"], "mutating": True, "desc": "write a text file under home (allow_actions only)"},
    ],
}

def _log(action, detail):
    try:
        os.makedirs(os.path.dirname(ACTLOG), exist_ok=True)
        with open(ACTLOG, "a") as f:
            f.write("%s  %s  %s\n" % (time.strftime("%Y-%m-%d %H:%M:%S"), action, detail))
    except Exception: pass

def _under_home(p):
    rp = os.path.realpath(os.path.expanduser(p))
    return rp == HOME or rp.startswith(HOME + os.sep) or rp.startswith(ROOT)

def host_info(args):
    info = {"os": platform.platform(), "machine": platform.machine(),
            "python": platform.python_version(), "cpus": os.cpu_count(), "host": platform.node()}
    try: info["load"] = [round(x, 2) for x in os.getloadavg()]
    except Exception: pass
    return info

def disk(args):
    t, u, f = shutil.disk_usage(HOME)
    g = lambda b: round(b / 1e9, 1)
    return {"total_gb": g(t), "used_gb": g(u), "free_gb": g(f), "pct_used": round(u / t * 100)}

def processes(args):
    try:
        out = subprocess.run(["ps", "axo", "rss,comm", "--sort=-rss"], capture_output=True,
                             text=True, timeout=8).stdout.splitlines()[1:9]
        return {"top": [{"mb": round(int(l.split(None, 1)[0]) / 1024, 1),
                         "name": l.split(None, 1)[1].strip()} for l in out if l.strip()]}
    except Exception as e:
        return {"error": str(e)}

def list_dir(args):
    p = os.path.realpath(os.path.expanduser(args.get("path", HOME)))
    if not _under_home(p): return {"error": "outside home"}
    if not os.path.isdir(p): return {"error": "not a folder"}
    try:
        return {"path": p, "items": [{"name": n, "dir": os.path.isdir(os.path.join(p, n))}
                                     for n in sorted(os.listdir(p))[:200]]}
    except Exception as e:
        return {"error": str(e)}

def read_file(args):
    p = os.path.realpath(os.path.expanduser(args.get("path", "")))
    if not _under_home(p): return {"error": "outside home"}
    if not os.path.isfile(p): return {"error": "not a file"}
    if os.path.getsize(p) > 1_500_000: return {"error": "file too large"}
    try: return {"path": p, "content": open(p, errors="replace").read()}
    except Exception as e: return {"error": str(e)}

def run_command(args):
    cmd = (args.get("cmd") or "").strip()
    if not cmd: return {"error": "empty command"}
    _log("RUN", cmd)
    try:
        p = subprocess.run(cmd, shell=True, cwd=HOME, capture_output=True, text=True, timeout=60)
        return {"code": p.returncode, "stdout": (p.stdout or "")[-6000:], "stderr": (p.stderr or "")[-2000:]}
    except subprocess.TimeoutExpired:
        return {"error": "timed out"}
    except Exception as e:
        return {"error": str(e)}

def write_file(args):
    p = os.path.realpath(os.path.expanduser(args.get("path", "")))
    if not _under_home(p): return {"error": "outside home"}
    content = args.get("content", "")
    try:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        open(p, "w").write(content)
        _log("WRITE", "%s (%d bytes)" % (p, len(content)))
        return {"path": p, "bytes": len(content)}
    except Exception as e:
        return {"error": str(e)}
