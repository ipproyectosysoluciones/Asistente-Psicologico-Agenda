#!/bin/sh
set -e

SESSION_PATH="${BOT_SESSION_PATH:-/app/bot_sessions}"

mkdir -p "$SESSION_PATH"

# Only restore from WA_CREDS_B64 when no session exists on the volume.
# After the first startup, Baileys manages key rotation itself on the volume —
# overwriting with an older snapshot causes the reconnect loop.
if [ -n "$WA_CREDS_B64" ] && [ ! -f "$SESSION_PATH/creds.json" ]; then
    echo "🔑 Restoring WhatsApp session from WA_CREDS_B64..."
    echo "$WA_CREDS_B64" | base64 -d > "$SESSION_PATH/creds.json"
    echo "✅ Session restored"
elif [ -f "$SESSION_PATH/creds.json" ]; then
    echo "📂 Using existing session from volume"
else
    echo "⚠️  No session found — bot will require pairing"
fi

exec node src/index.js
