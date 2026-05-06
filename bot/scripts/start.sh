#!/bin/sh
set -e

SESSION_PATH="${BOT_SESSION_PATH:-/app/bot_sessions}"

mkdir -p "$SESSION_PATH"

# Restore WhatsApp session from env var (base64-encoded creds.json)
if [ -n "$WA_CREDS_B64" ] && [ ! -f "$SESSION_PATH/creds.json" ]; then
    echo "🔑 Restoring WhatsApp session from WA_CREDS_B64..."
    echo "$WA_CREDS_B64" | base64 -d > "$SESSION_PATH/creds.json"
    echo "✅ Session restored"
fi

exec node src/index.js
