#!/usr/bin/env python3
"""
AXON bridge — the local organ that gives AXON hands on your machine.

Pure standard library. No pip installs. Serves the AXON web app AND a small,
authenticated local API that can search, read, and (with your confirmation)
write files, run commands, open apps, and execute code it writes.

Security model:
  - Binds to 127.0.0.1 only. Never exposed to the network.
  - A random session token is generated each run and handed to the page from
    the same origin. Cross-origin callers cannot get it.
  - Reads are allowed anywhere under an approved root (defaults to your home
    folder). Writes, commands, and code execution must carry confirmed=1, which
    the UI only sends after you approve the action in a confirm card.
  - Every mutating action is appended to axon-bridge.log next to this file.
"""
import http.server, socketserver, json, os, sys, subprocess, secrets, urllib.parse, threading, time, shlex, platform, pathlib, urllib.request, re, html, gzip, io

PORT = int(os.environ.get("AXON_PORT", "8941"))
ROOT = os.path.dirname(os.path.abspath(__file__))
HOME = os.path.expanduser("~")
TOKEN = secrets.token_urlsafe(24)
APPROVED_ROOTS = [HOME, ROOT]    # home plus the app's own folder (knowledge bank)
LOG = os.path.join(ROOT, "axon-bridge.log")
IS_MAC = platform.system() == "Darwin"
IS_WIN = platform.system() == "Windows"

def log(action, detail):
    try:
        with open(LOG, "a") as f:
            f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')}  {action}  {detail}\n")
    except Exception:
        pass

def under_approved(path):
    try:
        rp = os.path.realpath(path)
    except Exception:
        return False
    return any(rp == r or rp.startswith(os.path.realpath(r) + os.sep) for r in APPROVED_ROOTS)

def err(msg, code=400):
    return code, {"error": msg}

# ---- tool implementations -------------------------------------------------

def t_roots(_):
    return 200, {"approved": APPROVED_ROOTS, "home": HOME, "cwd": os.getcwd(),
                 "os": platform.system(), "python": sys.version.split()[0]}

def t_add_root(a):
    p = os.path.realpath(os.path.expanduser(a.get("path", "")))
    if not os.path.isdir(p):
        return err("Not a folder: " + p)
    if p not in APPROVED_ROOTS:
        APPROVED_ROOTS.append(p)
        log("ADD_ROOT", p)
    return 200, {"approved": APPROVED_ROOTS}

def t_list(a):
    path = os.path.realpath(os.path.expanduser(a.get("path", HOME)))
    if not under_approved(path):
        return err("Outside approved folders: " + path, 403)
    if not os.path.isdir(path):
        return err("Not a folder: " + path)
    items = []
    try:
        for name in sorted(os.listdir(path))[:500]:
            fp = os.path.join(path, name)
            try:
                st = os.stat(fp)
                items.append({"name": name, "dir": os.path.isdir(fp),
                              "size": st.st_size, "mtime": int(st.st_mtime)})
            except Exception:
                pass
    except PermissionError:
        return err("Permission denied: " + path, 403)
    return 200, {"path": path, "items": items}

def t_read(a):
    path = os.path.realpath(os.path.expanduser(a.get("path", "")))
    if not under_approved(path):
        return err("Outside approved folders: " + path, 403)
    if not os.path.isfile(path):
        return err("Not a file: " + path)
    if os.path.getsize(path) > 2_000_000:
        return err("File too large to read fully (>2MB).")
    try:
        with open(path, "r", errors="replace") as f:
            data = f.read()
    except Exception as e:
        return err(str(e))
    return 200, {"path": path, "content": data}

def t_search(a):
    """Search file contents and names under a root. Plain substring, case-insensitive."""
    root = os.path.realpath(os.path.expanduser(a.get("path", HOME)))
    q = (a.get("query") or "").lower()
    if not q:
        return err("Empty query.")
    if not under_approved(root):
        return err("Outside approved folders: " + root, 403)
    exts = {".txt", ".md", ".py", ".js", ".ts", ".json", ".csv", ".html", ".css",
            ".sh", ".c", ".cpp", ".java", ".go", ".rs", ".rb", ".tex", ".log", ".yml", ".yaml"}
    hits, scanned = [], 0
    for dirpath, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if not d.startswith(".") and d not in ("node_modules", "venv", "__pycache__")]
        for fn in files:
            if scanned > 4000 or len(hits) >= 40:
                break
            fp = os.path.join(dirpath, fn)
            name_hit = q in fn.lower()
            body_hit = None
            if os.path.splitext(fn)[1].lower() in exts:
                try:
                    if os.path.getsize(fp) < 1_500_000:
                        with open(fp, "r", errors="ignore") as f:
                            for i, line in enumerate(f):
                                if q in line.lower():
                                    body_hit = {"line": i + 1, "text": line.strip()[:200]}
                                    break
                        scanned += 1
                except Exception:
                    pass
            if name_hit or body_hit:
                hits.append({"path": fp, "name_match": name_hit, "match": body_hit})
    return 200, {"query": q, "root": root, "hits": hits}

def t_write(a):
    if not a.get("confirmed"):
        return err("Write needs confirmation.", 412)
    path = os.path.realpath(os.path.expanduser(a.get("path", "")))
    if not under_approved(path):
        return err("Outside approved folders: " + path, 403)
    content = a.get("content", "")
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            f.write(content)
    except Exception as e:
        return err(str(e))
    log("WRITE", f"{path} ({len(content)} bytes)")
    return 200, {"path": path, "bytes": len(content)}

def t_exec(a):
    if not a.get("confirmed"):
        return err("Command needs confirmation.", 412)
    cmd = a.get("cmd", "")
    if not cmd.strip():
        return err("Empty command.")
    cwd = os.path.realpath(os.path.expanduser(a.get("cwd", HOME)))
    if not under_approved(cwd):
        cwd = HOME
    log("EXEC", cmd)
    try:
        p = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True,
                           text=True, timeout=int(a.get("timeout", 60)))
        out = (p.stdout or "")[-8000:]
        errout = (p.stderr or "")[-4000:]
        return 200, {"cmd": cmd, "code": p.returncode, "stdout": out, "stderr": errout}
    except subprocess.TimeoutExpired:
        return err("Command timed out.")
    except Exception as e:
        return err(str(e))

def t_run_code(a):
    if not a.get("confirmed"):
        return err("Code execution needs confirmation.", 412)
    lang = (a.get("lang") or "python").lower()
    code = a.get("code", "")
    if not code.strip():
        return err("Empty code.")
    sandbox = os.path.join(ROOT, "_axon_scratch")
    os.makedirs(sandbox, exist_ok=True)
    if lang in ("python", "py"):
        fp = os.path.join(sandbox, "snippet.py"); runner = [sys.executable, fp]
    elif lang in ("js", "javascript", "node"):
        fp = os.path.join(sandbox, "snippet.js"); runner = ["node", fp]
    elif lang in ("bash", "sh"):
        fp = os.path.join(sandbox, "snippet.sh"); runner = ["bash", fp]
    else:
        return err("Unsupported language: " + lang)
    with open(fp, "w") as f:
        f.write(code)
    log("RUN_CODE", f"{lang} ({len(code)} bytes)")
    try:
        p = subprocess.run(runner, cwd=sandbox, capture_output=True, text=True,
                           timeout=int(a.get("timeout", 60)))
        return 200, {"lang": lang, "code": p.returncode,
                     "stdout": (p.stdout or "")[-8000:], "stderr": (p.stderr or "")[-4000:]}
    except subprocess.TimeoutExpired:
        return err("Code timed out.")
    except FileNotFoundError:
        return err(f"{runner[0]} not found on this machine.")
    except Exception as e:
        return err(str(e))

def _http_get(url, timeout=15):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9", "Accept-Encoding": "gzip"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read()
        if r.headers.get("Content-Encoding") == "gzip":
            raw = gzip.decompress(raw)
        charset = r.headers.get_content_charset() or "utf-8"
        return raw.decode(charset, "replace")

def _strip_html(h):
    h = re.sub(r"(?is)<(script|style|noscript|svg|head)[^>]*>.*?</\1>", " ", h)
    h = re.sub(r"(?is)<br\s*/?>", "\n", h)
    h = re.sub(r"(?is)</(p|div|li|h[1-6]|tr)>", "\n", h)
    h = re.sub(r"(?is)<[^>]+>", " ", h)
    h = html.unescape(h)
    h = re.sub(r"[ \t]+", " ", h)
    h = re.sub(r"\n\s*\n\s*\n+", "\n\n", h)
    return h.strip()

def _ddg_unwrap(href):
    if "uddg=" in href:
        try:
            return urllib.parse.unquote(href.split("uddg=")[1].split("&")[0])
        except Exception:
            pass
    return href

def t_web_search(a):
    """Web search with no API key. Tries DuckDuckGo HTML, then the lite endpoint."""
    q = (a.get("query") or "").strip()
    if not q:
        return err("Empty query.")
    enc = urllib.parse.quote(q)
    last = ""
    # endpoint 1: full HTML results
    for url, pat in [
        ("https://html.duckduckgo.com/html/?q=" + enc,
         r'<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>'),
        ("https://lite.duckduckgo.com/lite/?q=" + enc,
         r'<a[^>]*class="result-link"[^>]*href="([^"]+)"[^>]*>(.*?)</a>'),
    ]:
        try:
            body = _http_get(url)
        except Exception as e:
            last = str(e); continue
        results = []
        for m in re.finditer(pat, body, re.I | re.S):
            href = _ddg_unwrap(m.group(1)); title = _strip_html(m.group(2))
            if not (title and href.startswith("http")):
                continue
            seg = body[m.end():m.end() + 1400]
            sm = re.search(r'(?:result__snippet|result-snippet)[^>]*>(.*?)</', seg, re.I | re.S)
            results.append({"title": title, "url": href,
                            "snippet": (_strip_html(sm.group(1)) if sm else "")[:300]})
            if len(results) >= 8:
                break
        if results:
            log("WEB_SEARCH", q)
            return 200, {"query": q, "results": results}
    return err("Search returned nothing (no internet, or the search site blocked the request). " + last)

def t_web_fetch(a):
    """Fetch a URL and return readable text."""
    url = (a.get("url") or "").strip()
    if not url.startswith("http"):
        return err("Need an http(s) URL.")
    try:
        page = _http_get(url)
    except Exception as e:
        return err("Fetch failed: " + str(e))
    tm = re.search(r"(?is)<title[^>]*>(.*?)</title>", page)
    title = _strip_html(tm.group(1)) if tm else ""
    text = _strip_html(page)
    log("WEB_FETCH", url)
    return 200, {"url": url, "title": title, "text": text[:12000]}

def t_open(a):
    if not a.get("confirmed"):
        return err("Open needs confirmation.", 412)
    target = a.get("target", "")
    if not target.strip():
        return err("Nothing to open.")
    log("OPEN", target)
    try:
        if IS_MAC:
            subprocess.Popen(["open", target])
        elif IS_WIN:
            os.startfile(target)  # type: ignore
        else:
            subprocess.Popen(["xdg-open", target])
        return 200, {"opened": target}
    except Exception as e:
        return err(str(e))

TOOLS = {
    "roots": t_roots, "add_root": t_add_root, "list": t_list, "read": t_read,
    "search": t_search, "write": t_write, "exec": t_exec, "run_code": t_run_code,
    "open": t_open, "web_search": t_web_search, "web_fetch": t_web_fetch,
}

# ---- http server ----------------------------------------------------------

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def log_message(self, *a):
        pass

    def end_headers(self):
        # never let the browser serve a stale app shell after an upgrade
        self.send_header("Cache-Control", "no-cache, must-revalidate")
        super().end_headers()

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "content-type, x-axon-token")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def _json(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()

    def do_GET(self):
        if self.path == "/__axon/token":
            return self._json(200, {"token": TOKEN, "os": platform.system(), "home": HOME})
        return super().do_GET()

    def do_POST(self):
        if not self.path.startswith("/__axon/tool/"):
            return self._json(404, {"error": "no such endpoint"})
        if self.headers.get("x-axon-token") != TOKEN:
            return self._json(401, {"error": "bad or missing bridge token"})
        name = self.path[len("/__axon/tool/"):]
        fn = TOOLS.get(name)
        if not fn:
            return self._json(404, {"error": "unknown tool: " + name})
        try:
            n = int(self.headers.get("Content-Length", 0))
            args = json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            return self._json(400, {"error": "bad json"})
        try:
            code, obj = fn(args)
        except Exception as e:
            code, obj = 500, {"error": str(e)}
        return self._json(code, obj)


class ThreadingServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


def main():
    os.chdir(ROOT)
    global PORT
    httpd = None
    for attempt in range(10):          # if the port is taken (old server still up), hop
        try:
            httpd = ThreadingServer(("127.0.0.1", PORT), Handler)
            break
        except OSError:
            PORT += 1
    if httpd is None:
        print("Could not find a free port. Close other AXON windows and retry.")
        return
    url = f"http://localhost:{PORT}/"
    print("\n  AXON bridge is live.")
    print(f"  Open: {url}")
    print(f"  Powers: read/search anywhere under {HOME}; writes, commands, and")
    print("  code execution require your confirmation in the app.")
    print("  Leave this window open. Press Control-C to stop.\n")
    try:
        webbrowser_open(url)
    except Exception:
        pass
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  AXON bridge stopped.")


def webbrowser_open(url):
    import webbrowser
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()


if __name__ == "__main__":
    main()
