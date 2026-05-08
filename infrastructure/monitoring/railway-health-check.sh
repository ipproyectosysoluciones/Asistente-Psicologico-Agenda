#!/usr/bin/env bash
set -euo pipefail

# Health check poller for Railway deployment
# Polls $RAILWAY_PUBLIC_URL/health every INTERVAL seconds.
# Sends webhook alert to $ALERT_WEBHOOK_URL on MAX_FAILS consecutive failures.
# Exits gracefully if RAILWAY_PUBLIC_URL is not set.

: "${RAILWAY_PUBLIC_URL:=}"
if [ -z "$RAILWAY_PUBLIC_URL" ]; then
  echo "RAILWAY_PUBLIC_URL not set, exiting"
  exit 0
fi

FAIL_COUNT=0
MAX_FAILS="${MAX_FAILS:-3}"
INTERVAL="${INTERVAL:-60}"
ALERT_WEBHOOK_URL="${ALERT_WEBHOOK_URL:-}"

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) Health check started: ${RAILWAY_PUBLIC_URL}/health (interval=${INTERVAL}s, max_fails=${MAX_FAILS})"

while true; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${RAILWAY_PUBLIC_URL}/health" --max-time 10 2>/dev/null || echo "000")

  if [[ "$STATUS" =~ ^2 ]]; then
    if [ "$FAIL_COUNT" -gt 0 ]; then
      echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) Health check recovered (HTTP $STATUS)"
    fi
    FAIL_COUNT=0
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) Health check failed ($FAIL_COUNT/$MAX_FAILS): HTTP $STATUS"

    if [ "$FAIL_COUNT" -ge "$MAX_FAILS" ]; then
      echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) Sending alert to webhook..."
      if [ -n "$ALERT_WEBHOOK_URL" ]; then
        curl -s -X POST "$ALERT_WEBHOOK_URL" \
          -H "Content-Type: application/json" \
          -d "{\"text\":\"ALERT: ${RAILWAY_PUBLIC_URL}/health failed ${MAX_FAILS} times consecutively (last HTTP status: ${STATUS})\"}" \
          --max-time 10 || true
      else
        echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) WARNING: ALERT_WEBHOOK_URL not set, skipping notification" >&2
      fi
      FAIL_COUNT=0
    fi
  fi

  sleep "$INTERVAL"
done
