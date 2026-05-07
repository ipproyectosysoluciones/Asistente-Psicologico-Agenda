#!/bin/sh
set -e

SESSION_PATH="${BOT_SESSION_PATH:-/app/bot_sessions}"

mkdir -p "$SESSION_PATH"

# Always restore from WA_CREDS_B64 when set — overrides any stale volume file
if [ -n "$WA_CREDS_B64" ]; then
    echo "🔑 Restoring WhatsApp session from WA_CREDS_B64..."
    echo "$WA_CREDS_B64" | base64 -d > "$SESSION_PATH/creds.json"
    echo "✅ Session restored"
fi

exec node src/index.js
