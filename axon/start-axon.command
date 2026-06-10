#!/bin/bash
# Double-click this on a Mac to launch AXON with full machine access.
# It starts the AXON bridge (a tiny local server in this folder) and opens it.
cd "$(dirname "$0")"
echo "Starting AXON ..."
if command -v python3 >/dev/null 2>&1; then
  python3 bridge.py
elif command -v python >/dev/null 2>&1; then
  python bridge.py
else
  echo "Python was not found. Install it once with: xcode-select --install"
  echo "Then double-click this file again."
  read -n 1 -s -r -p "Press any key to close."
fi
