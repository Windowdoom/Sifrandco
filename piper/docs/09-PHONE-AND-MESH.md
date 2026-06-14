# 09 · Your phone, and reaching Piper anywhere

Piper runs on a computer; your phone opens it like an app. By default Piper binds to
`127.0.0.1` (that machine only). To reach it from another device you flip one setting and a
security token turns on automatically.

## Same Wi-Fi (simplest)
1. On the host machine, in `piper.conf` set `"host": "0.0.0.0"` and relaunch.
2. The terminal prints a phone link with a key, e.g.
   `http://192.168.1.50:7777/?k=AbC123...`
3. On the phone (same Wi-Fi), open that exact link in Safari/Chrome. It connects and
   remembers the key in a cookie.
4. **Add to Home Screen** (Share menu). You get a صفر app icon, full-screen.

## Anywhere — the private mesh (recommended)
A laptop's Wi-Fi address changes and isn't reachable away from home. Use a mesh:
1. Install **Tailscale** (free, tailscale.com) on the host and the phone, same account.
2. It gives each device a stable private address that works from anywhere, encrypted, with
   no ports opened to the public internet.
3. Use the host's Tailscale address in the phone link instead of the Wi-Fi IP.

## Security
When `host` is anything other than loopback, every request requires the `?k=` token — per
the SifarOS rule, no open unauthenticated port on a network, ever. Keep the link private.
Prefer Tailscale over plain `0.0.0.0` on untrusted networks.

## What can go wrong
| Symptom | Cause | Fix |
|---|---|---|
| Phone can't load the page | different network, or firewall | Same Wi-Fi, or use Tailscale; allow the port in the host firewall. |
| "Open the full link with ?k=" | missing/instale token | Re-open the exact printed link including `?k=`. |
| Works at home, not away | Wi-Fi IP isn't routable | Use Tailscale. |
| Phone shows old version | cached | Pull to refresh, or remove and re-add to Home Screen. |
| Host sleeps, phone gets nothing | the brain machine is off | Run Piper on an always-on node (`10`). |
