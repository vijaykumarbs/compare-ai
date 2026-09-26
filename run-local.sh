#!/bin/sh
# Serve from this folder on loopback so the app works without exposing it to a LAN.
set -eu
cd "$(dirname "$0")"
exec python3 -m http.server 4173 --bind 127.0.0.1
