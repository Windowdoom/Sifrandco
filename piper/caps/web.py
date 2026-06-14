"""Capability: web — search and read the live internet. No API key.

Capabilities are how Piper grows. Drop a file in caps/, declare a MANIFEST and
the tool functions it names, and Piper discovers it on launch and can use it.
Read-only tools (mutating: False) run freely; mutating ones are gated by
allow_actions in piper.conf.
"""
import re, gzip, html, urllib.request, urllib.parse

MANIFEST = {
    "name": "web",
    "summary": "search the live web and read pages",
    "tools": [
        {"name": "web_search", "args": ["query"], "mutating": False,
         "desc": "search the web, returns titles, urls, snippets"},
        {"name": "web_fetch", "args": ["url"], "mutating": False,
         "desc": "fetch a page and return its readable text"},
    ],
}

def _get(url, timeout=15):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/122 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9", "Accept-Encoding": "gzip"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read()
        if r.headers.get("Content-Encoding") == "gzip":
            raw = gzip.decompress(raw)
        return raw.decode(r.headers.get_content_charset() or "utf-8", "replace")

def _strip(h):
    h = re.sub(r"(?is)<(script|style|noscript|svg|head)[^>]*>.*?</\1>", " ", h)
    h = re.sub(r"(?is)</(p|div|li|h[1-6]|tr|br)>", "\n", h)
    h = re.sub(r"(?is)<[^>]+>", " ", h)
    return re.sub(r"[ \t]+", " ", re.sub(r"\n\s*\n\s*\n+", "\n\n", html.unescape(h))).strip()

def _unwrap(href):
    if "uddg=" in href:
        try: return urllib.parse.unquote(href.split("uddg=")[1].split("&")[0])
        except Exception: pass
    return href

def web_search(args):
    q = (args.get("query") or "").strip()
    if not q: return {"error": "empty query"}
    enc = urllib.parse.quote(q)
    for url, pat in [
        ("https://html.duckduckgo.com/html/?q=" + enc, r'class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>'),
        ("https://lite.duckduckgo.com/lite/?q=" + enc, r'class="result-link"[^>]*href="([^"]+)"[^>]*>(.*?)</a>'),
    ]:
        try: body = _get(url)
        except Exception: continue
        out = []
        for m in re.finditer(pat, body, re.I | re.S):
            href, title = _unwrap(m.group(1)), _strip(m.group(2))
            if not (title and href.startswith("http")): continue
            seg = body[m.end():m.end() + 1400]
            sm = re.search(r"(?:result__snippet|result-snippet)[^>]*>(.*?)</", seg, re.I | re.S)
            out.append({"title": title, "url": href, "snippet": (_strip(sm.group(1)) if sm else "")[:280]})
            if len(out) >= 6: break
        if out: return {"results": out}
    return {"error": "no results (offline or blocked)"}

def web_fetch(args):
    url = (args.get("url") or "").strip()
    if not url.startswith("http"): return {"error": "need an http(s) url"}
    try: page = _get(url)
    except Exception as e: return {"error": "fetch failed: %s" % e}
    tm = re.search(r"(?is)<title[^>]*>(.*?)</title>", page)
    return {"url": url, "title": _strip(tm.group(1)) if tm else "", "text": _strip(page)[:9000]}
