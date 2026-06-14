# 10 · Running Piper always-on (the home server)

For Piper to be there whenever you (or your phone) reach for it, it should run 24/7 on a
machine that does not sleep — ideally a dedicated node (a mini-PC, a spare laptop, a Pi),
with your Mac as an occasional amplifier and the phone as a window.

## Install as a service
From the piper folder:
```
bash service/install.sh
```
- **Linux** → a systemd *user* service (`piper.service`), enabled to start at boot, with
  lingering on so it survives logout, and a 1.5 GB memory cap so a runaway restarts instead
  of freezing the box.
- **macOS** → a launchd agent that starts at login and restarts on crash; logs to
  `data/piper.out.log` and `data/piper.err.log`.

Re-run the script after updating Piper.

## Manage it
- Linux: `systemctl --user status piper` · `... restart piper` · `... disable --now piper`
- macOS: `launchctl unload ~/Library/LaunchAgents/com.sifaros.piper.plist` to stop;
  `launchctl load ...` to start.

## The recommended topology
- **Home node** (always-on): runs Piper + Ollama, holds `knowledge/`, `data/`, memory.
- **Mac** (when awake): can run a bigger model and be routed to for hard reasoning.
- **Phone**: opens the home node over Tailscale.
This matches the SifarOS manifesto: the node holds the data and the mind; other devices are
windows.

## What can go wrong
| Symptom | Cause | Fix |
|---|---|---|
| Service won't start | wrong Python path or working dir | Re-run `service/install.sh` from inside the piper folder. |
| Stops after logout (Linux) | lingering not enabled | `loginctl enable-linger $USER`. |
| Eats memory | model too big | Smaller model; the cap will restart it; lower `MemoryMax` in the unit. |
| Changes not live | service running old code | Re-run install script, or restart the service. |
| Can't reach after reboot | host bind/token | Confirm `host` and re-open the `?k=` link. |
