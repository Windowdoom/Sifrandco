"""Capability: mcp — speak the Model Context Protocol, the open standard that lets
Piper borrow tools from the whole MCP ecosystem (filesystem, GitHub, Slack, search,
databases, and hundreds more, growing fast).

An MCP server is a small program Piper launches and talks to over stdin/stdout in
JSON-RPC. Configure servers in piper.conf:

  "mcp_servers": {
    "files": { "command": ["npx","-y","@modelcontextprotocol/server-filesystem","/Users/you/Documents"] },
    "fetch": { "command": ["uvx","mcp-server-fetch"] }
  }

Then Piper can list and call their tools. EXPERIMENTAL: MCP is young and evolving,
and each server has its own install needs (Node via npx, Python via uvx, etc.).
See docs/08-MCP.md for setup and troubleshooting. Without config this loads quietly.
"""
import json, os, subprocess, threading

def _conf():
    p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "piper.conf")
    try: return json.load(open(p))
    except Exception: return {}

def _servers():
    return (_conf().get("mcp_servers") or {})

class _Session:
    """One short-lived JSON-RPC session to an MCP server over stdio (newline-delimited)."""
    def __init__(self, command):
        self.p = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                  stderr=subprocess.DEVNULL, text=True, bufsize=1)
        self._id = 0
    def _send(self, method, params=None, notify=False):
        self._id += 1
        msg = {"jsonrpc": "2.0", "method": method}
        if params is not None: msg["params"] = params
        if not notify: msg["id"] = self._id
        self.p.stdin.write(json.dumps(msg) + "\n"); self.p.stdin.flush()
        if notify: return None
        # read until we get a line that parses with our id (skip server logs/notifications)
        for _ in range(200):
            line = self.p.stdout.readline()
            if not line: break
            line = line.strip()
            if not line: continue
            try: obj = json.loads(line)
            except Exception: continue
            if obj.get("id") == self._id: return obj
        return {"error": {"message": "no response from MCP server"}}
    def initialize(self):
        r = self._send("initialize", {"protocolVersion": "2024-11-05",
            "capabilities": {}, "clientInfo": {"name": "piper", "version": "1"}})
        self._send("notifications/initialized", notify=True)
        return r
    def close(self):
        try: self.p.terminate()
        except Exception: pass

def _run(server, fn):
    srv = _servers().get(server)
    if not srv or not srv.get("command"):
        return {"error": "MCP server '%s' is not in piper.conf mcp_servers." % server}
    try:
        s = _Session(srv["command"]); s.initialize()
        try: return fn(s)
        finally: s.close()
    except FileNotFoundError:
        return {"error": "Could not launch '%s'. Its runtime (e.g. npx or uvx) is not installed. See docs/08-MCP.md." % server}
    except Exception as e:
        return {"error": "MCP error: %s" % e}

MANIFEST = {
    "name": "mcp",
    "summary": "use tools from configured MCP servers (the open tool ecosystem)",
    "tools": [
        {"name": "mcp_servers", "args": [], "mutating": False, "desc": "list configured MCP servers"},
        {"name": "mcp_tools", "args": ["server"], "mutating": False, "desc": "list a server's tools"},
        {"name": "mcp_call", "args": ["server", "tool", "arguments"], "mutating": True,
         "desc": "call a tool on an MCP server (mutating: it may change things)"},
    ],
}

def mcp_servers(args):
    return {"servers": list(_servers().keys())}

def mcp_tools(args):
    server = (args.get("server") or "").strip()
    def fn(s):
        r = s._send("tools/list")
        tools = ((r or {}).get("result") or {}).get("tools", [])
        return {"tools": [{"name": t.get("name"), "desc": t.get("description", "")[:160]} for t in tools]}
    return _run(server, fn)

def mcp_call(args):
    server = (args.get("server") or "").strip()
    tool = (args.get("tool") or "").strip()
    arguments = args.get("arguments") or {}
    if not tool: return {"error": "need a tool name"}
    def fn(s):
        r = s._send("tools/call", {"name": tool, "arguments": arguments})
        res = (r or {}).get("result") or (r or {}).get("error") or {}
        # MCP returns content blocks; flatten text for the model
        if isinstance(res, dict) and "content" in res:
            txt = " ".join(b.get("text", "") for b in res["content"] if isinstance(b, dict))
            return {"text": txt[:6000]}
        return {"result": str(res)[:6000]}
    return _run(server, fn)
