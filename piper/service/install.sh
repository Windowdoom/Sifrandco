#!/usr/bin/env bash
# Install Piper as an always-on service so it runs 24/7 — the home-server companion.
# Linux -> systemd user service.  macOS -> launchd agent.  Re-run to update.
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)"
PY="$(command -v python3 || command -v python)"
[ -z "$PY" ] && { echo "Python 3 not found."; exit 1; }

case "$(uname -s)" in
  Linux)
    mkdir -p ~/.config/systemd/user
    cat > ~/.config/systemd/user/piper.service <<UNIT
[Unit]
Description=Piper personal AI
After=network-online.target

[Service]
Type=simple
WorkingDirectory=$DIR
ExecStart=$PY $DIR/piper.py
Restart=on-failure
RestartSec=5
MemoryMax=1500M

[Install]
WantedBy=default.target
UNIT
    systemctl --user daemon-reload
    systemctl --user enable --now piper.service
    loginctl enable-linger "$USER" 2>/dev/null || true   # keep running after logout
    echo "✓ Piper is now a systemd service. Status: systemctl --user status piper"
    ;;
  Darwin)
    PLIST=~/Library/LaunchAgents/com.sifaros.piper.plist
    cat > "$PLIST" <<UNIT
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.sifaros.piper</string>
  <key>ProgramArguments</key><array><string>$PY</string><string>$DIR/piper.py</string></array>
  <key>WorkingDirectory</key><string>$DIR</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$DIR/data/piper.out.log</string>
  <key>StandardErrorPath</key><string>$DIR/data/piper.err.log</string>
</dict></plist>
UNIT
    launchctl unload "$PLIST" 2>/dev/null || true
    launchctl load "$PLIST"
    echo "✓ Piper is now a launchd agent. It starts at login and restarts if it crashes."
    ;;
  *) echo "Unsupported OS. Run python3 piper.py manually."; exit 1;;
esac
