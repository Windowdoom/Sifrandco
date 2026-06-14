"""Capability: home — control the physical world through Home Assistant.

Home Assistant is the open-source hub that already speaks to thousands of devices
(lights, locks, thermostats, cameras, sensors, plugs). Piper talks to ONE thing —
Home Assistant's REST API — and through it reaches everything HA supports. You do
not integrate each device; HA does. That is the whole point.

Setup (see docs/07-HOME-ASSISTANT.md):
  1. Run Home Assistant on your network (its own box, a Pi, or a container).
  2. In HA: your profile -> Long-Lived Access Tokens -> create one.
  3. In piper.conf add:
       "home_assistant_url": "http://homeassistant.local:8123",
       "home_assistant_token": "PASTE_THE_TOKEN"
Without those, this capability loads but politely reports it is not configured.
"""
import json, urllib.request, urllib.parse

def _conf():
    # read piper.conf directly so the capability stays self-contained
    import os
    p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "piper.conf")
    try: return json.load(open(p))
    except Exception: return {}

def _api(path, method="GET", body=None):
    c = _conf()
    base = (c.get("home_assistant_url") or "").rstrip("/")
    tok = c.get("home_assistant_token") or ""
    if not base or not tok:
        return {"error": "Home Assistant is not configured. Add home_assistant_url and "
                         "home_assistant_token to piper.conf (see docs/07-HOME-ASSISTANT.md)."}
    req = urllib.request.Request(base + path, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": "Bearer " + tok, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=12) as r:
            return json.loads(r.read().decode() or "null")
    except Exception as e:
        return {"error": "Home Assistant call failed: %s. Check the URL, token, and that HA is reachable." % e}

MANIFEST = {
    "name": "home",
    "summary": "see and control smart-home devices via Home Assistant",
    "tools": [
        {"name": "ha_devices", "args": [], "mutating": False,
         "desc": "list smart-home entities and their states"},
        {"name": "ha_get", "args": ["entity"], "mutating": False,
         "desc": "get one entity's state, e.g. light.kitchen"},
        {"name": "ha_control", "args": ["domain", "service", "entity"], "mutating": True,
         "desc": "call a service, e.g. domain=light service=turn_off entity=light.kitchen"},
    ],
}

def ha_devices(args):
    data = _api("/api/states")
    if isinstance(data, dict) and data.get("error"): return data
    out = []
    for s in (data or []):
        eid = s.get("entity_id", "")
        if eid.split(".")[0] in ("light","switch","lock","climate","cover","fan","sensor","binary_sensor","media_player","scene"):
            out.append({"entity": eid, "state": s.get("state"),
                        "name": (s.get("attributes") or {}).get("friendly_name", eid)})
    return {"count": len(out), "devices": out[:120]}

def ha_get(args):
    e = (args.get("entity") or "").strip()
    if not e: return {"error": "need an entity id"}
    return _api("/api/states/" + urllib.parse.quote(e))

def ha_control(args):
    domain = (args.get("domain") or "").strip()
    service = (args.get("service") or "").strip()
    entity = (args.get("entity") or "").strip()
    if not (domain and service): return {"error": "need domain and service"}
    body = {"entity_id": entity} if entity else {}
    return _api("/api/services/%s/%s" % (domain, service), method="POST", body=body)
