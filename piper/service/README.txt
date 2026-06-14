ALWAYS-ON (the home-server companion)

Run this once to keep Piper running 24/7, restarting itself if it crashes or the
machine reboots:

    bash service/install.sh

Linux installs a systemd user service (and enables lingering so it survives logout).
macOS installs a launchd agent that starts at login. Re-run after updates.

To stop it:
  Linux:  systemctl --user disable --now piper
  macOS:  launchctl unload ~/Library/LaunchAgents/com.sifaros.piper.plist

The natural home for this is the always-on node (the HP box), with the Mac as an
occasional amplifier and the phone as a window over Tailscale.
