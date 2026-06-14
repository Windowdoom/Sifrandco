# 07 · Home Assistant — connecting the physical world

Home Assistant (HA) is the open-source hub that already integrates thousands of devices:
lights, locks, thermostats, plugs, cameras, sensors, media players. Piper talks to HA's
REST API, and through HA it reaches everything HA supports. You integrate devices once, in
HA; Piper just asks HA.

## Setup
1. **Run Home Assistant** on your network. Easiest: a Raspberry Pi or a spare mini-PC with
   Home Assistant OS, or a Docker container. Follow home-assistant.io/installation.
2. Add your devices in HA's UI (it auto-discovers most). Confirm you can toggle them there.
3. **Make a token:** in HA, click your user (bottom-left) → Security → Long-Lived Access
   Tokens → Create Token. Copy it (you see it once).
4. **Tell Piper** — in `piper.conf`:
   ```
   "home_assistant_url": "http://homeassistant.local:8123",
   "home_assistant_token": "PASTE_TOKEN_HERE"
   ```
   If `homeassistant.local` doesn't resolve, use HA's IP, e.g. `http://192.168.1.20:8123`.
5. Relaunch Piper. Try: "what smart-home devices do I have" then "turn off the kitchen light"
   (controlling a device is a mutating action, so you'll get a confirm card).

## What can go wrong
| Symptom | Cause | Fix |
|---|---|---|
| "Home Assistant is not configured" | url/token missing in piper.conf | Add both, relaunch. |
| "call failed" / connection refused | wrong URL or HA not reachable | Use HA's IP; ensure same network or mesh; check HA is running. |
| 401 Unauthorized | bad/expired token | Make a new Long-Lived token. |
| Device not listed | wrong entity domain or not exposed | Check the entity_id in HA (Developer Tools → States). |
| Control "succeeds" but nothing happens | wrong domain/service/entity | Use exact ids, e.g. domain=light, service=turn_on, entity=light.kitchen. |

Security: HA holds real control of your home. Keep it on your private network or mesh
(see `09`), never exposed raw to the internet, and keep `"actions": "confirm"` so Piper
asks before it acts.
