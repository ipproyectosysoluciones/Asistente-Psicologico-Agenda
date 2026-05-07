#!/bin/sh
set -e

SESSION_PATH="${BOT_SESSION_PATH:-/app/bot_sessions}"

mkdir -p "$SESSION_PATH"

# WA_FORCE_RESET=true  →  wipe session, restore from WA_CREDS_B64 (or leave empty for fresh pairing)
# Normal restart       →  use volume session if it exists, otherwise restore from WA_CREDS_B64
if [ "$WA_FORCE_RESET" = "true" ]; then
    echo "🔄 Force reset: clearing existing session..."
    rm -f "$SESSION_PATH"/*.json
    if [ -n "$WA_CREDS_B64" ]; then
        echo "$WA_CREDS_B64" | base64 -d > "$SESSION_PATH/creds.json"
        echo "✅ Session restored from WA_CREDS_B64"
    else
        echo "⚠️  WA_FORCE_RESET set without WA_CREDS_B64 — bot will request pairing code"
    fi
elif [ -f "$SESSION_PATH/creds.json" ]; then
    echo "📂 Using existing session from volume"
elif [ -n "$WA_CREDS_B64" ]; then
    echo "🔑 Restoring WhatsApp session from WA_CREDS_B64..."
    echo "$WA_CREDS_B64" | base64 -d > "$SESSION_PATH/creds.json"
    echo "✅ Session restored"
else
    echo "⚠️  No session found — bot will request pairing code"
fi

exec node src/index.js
