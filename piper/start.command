#!/bin/bash
# Double-click on a Mac, or run on any Linux box, to launch Piper.
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then exec python3 piper.py
elif command -v python >/dev/null 2>&1; then exec python piper.py
else echo "Python 3 not found. Install it (Mac: xcode-select --install) and run this again."; read -n 1 -s; fi
