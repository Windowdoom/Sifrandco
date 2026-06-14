# 01 · Install, from zero

Piper needs two things: **Python 3** and a **web browser**. That is the whole hard
dependency. Everything else (a local model, smart-home, etc.) is optional and added later.

## Mac

1. Check Python: open Terminal, type `python3 --version`. If you see a version, skip to 3.
2. If missing: run `xcode-select --install` and accept the prompt. That installs `python3`.
   (Alternative: install from python.org, or `brew install python` if you use Homebrew.)
3. Unzip the `piper` folder somewhere permanent (Documents is fine, not Downloads —
   macOS sometimes quarantines Downloads).
4. Double-click `start.command`.
   - First time, macOS may say "unidentified developer." Right-click the file → Open →
     Open. You only do this once.
5. A browser opens to `http://localhost:7777`. Click once so voice can speak.

## Linux

1. `python3 --version` (almost always present). If not: `sudo apt install python3` (Debian/Ubuntu)
   or your distro's equivalent.
2. Unzip the folder. In a terminal: `cd /path/to/piper && python3 piper.py`
   (or double-click `start.command` if your file manager allows).
3. Open `http://localhost:7777`.

## Windows

1. Install Python from python.org. **Tick "Add python.exe to PATH"** during install — this
   is the single most common Windows mistake.
2. Unzip the folder. Double-click `start.bat`.
3. If a blue "Windows protected your PC" box appears: More info → Run anyway.
4. Open `http://localhost:7777`.

## Phone

You do not install Piper on a phone. You run it on a computer and open it from the phone.
See `09-PHONE-AND-MESH.md`.

## What can go wrong

| Symptom | Cause | Fix |
|---|---|---|
| "Python was not found" | Python not installed or not on PATH | Mac: `xcode-select --install`. Windows: reinstall Python with "Add to PATH" ticked. |
| Browser doesn't open | launcher couldn't reach a browser | Open `http://localhost:7777` yourself. |
| "address already in use" | another Piper is running | It auto-hops to 7778, 7779… check the terminal for the real address. Or close the old one. |
| Page is blank / unstyled | a file didn't unzip | Re-unzip the whole folder; keep `shell/` intact. |
| `start.command` won't run on Mac | not executable | In Terminal: `chmod +x start.command`, or run `python3 piper.py`. |
| Port 7777 blocked by firewall | local firewall | Change `"port"` in `piper.conf` to e.g. 8800. |

If all else fails, the lowest-level launch that always works:
```
cd /path/to/piper
python3 piper.py
```
Read the terminal output — it prints the exact address and any error.
