# 05 · Capabilities — the plugin system

Capabilities are how Piper grows into an ecosystem. Each file in `caps/` adds tools Piper
can call. They are discovered automatically on launch. This is the socket every future
connection — apps, hardware, services — plugs into.

## Shipped capabilities
- **web** — `web_search`, `web_fetch`. Search and read the live internet (no API key).
- **system** — `host_info`, `disk`, `processes`, `list_dir`, `read_file` (read-only) and
  `run_command`, `write_file` (mutating; see `06-ACTIONS-SAFETY.md`).
- **home** — `ha_devices`, `ha_get`, `ha_control`. Smart-home via Home Assistant (`07`).
- **mcp** — `mcp_servers`, `mcp_tools`, `mcp_call`. The open tool ecosystem (`08`).
- **tasks** — `task_add`, `task_list`, `task_done`. A durable personal to-do list.

## Write your own (the whole contract)
Create `caps/weather.py`:
```python
MANIFEST = {
  "name": "weather",
  "summary": "local weather",
  "tools": [
    {"name": "forecast", "args": ["city"], "mutating": False, "desc": "today's forecast"},
  ],
}
def forecast(args):
    city = args.get("city", "")
    # ... do the work, return a JSON-able dict ...
    return {"city": city, "high": 88, "low": 74}
```
Relaunch. Piper now knows the tool and will call it when useful. Rules:
- `mutating: False` tools run freely. `mutating: True` tools are gated (off/confirm/auto).
- Return a small JSON-serializable dict. Keep results short; the model reads them.
- Read config yourself if you need secrets (see `caps/home.py` for the pattern).

## What can go wrong
| Symptom | Cause | Fix |
|---|---|---|
| A capability didn't load | syntax error in the file | The terminal prints "capability X failed to load: …". Fix and relaunch. |
| Tool exists but never used | model didn't see a need, or model too weak | Ask more directly; use a bigger model. |
| Tool errors | bug or bad args | It returns `{"error": …}`; the model relays it. Check the file. |
