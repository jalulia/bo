#!/bin/zsh
# Swaps the engine files inside Desktop Bo.app, re-signs it, restarts it.
set -e
HERE="${0:A:h}"
APP="/Applications/Desktop Bo.app"; [ -d "$APP" ] || APP="$HOME/Applications/Desktop Bo.app"
pkill -f "Desktop Bo.app/Contents/MacOS" 2>/dev/null || true
sleep 1
ditto "$HERE/engine" "$APP/Contents/Resources/app/engine"
codesign --force --deep --sign - "$APP"
open "$APP"
echo "Updated: $APP"
