/**
 * k6 Load Test — Asistente Psicológico
 * Task 5.16 — 1000 concurrent users
 *
 * Run:
 *   k6 run k6-load-test.js
 *   k6 run --env BASE_URL=https://your-app.railway.app k6-load-test.js
 *
 * Install k6: https://k6.io/docs/getting-started/installation/
 */

import http from 'k6/http'
import { sleep, check, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

// ─── Custom metrics ──────────────────────────────────────────────────────────

const loginDuration    = new Trend('login_duration_ms')
const appointmentsFail = new Rate('appointments_failure_rate')
const totalRequests    = new Counter('total_requests')

// ─── Options ─────────────────────────────────────────────────────────────────

export const options = {
  stages: [
    { duration: '2m', target: 100  },  // ramp-up to 100 users
    { duration: '5m', target: 500  },  // ramp-up to 500 users
    { duration: '5m', target: 1000 },  // ramp-up to 1000 users — peak
    { duration: '3m', target: 1000 },  // hold peak load
    { duration: '2m', target: 0   },   // ramp-down
  ],
  thresholds: {
    // 95% of requests must complete within 2s
    http_req_duration: ['p(95)<2000'],
    // Error rate must stay below 1%
    http_req_failed: ['rate<0.01'],
    // Login must be fast
    login_duration_ms: ['p(99)<3000'],
    // Appointments endpoint failure rate
    appointments_failure_rate: ['rate<0.02'],
  },
}

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = __ENV.BASE_URL || 'https://your-app.railway.app'
const N8N_URL  = __ENV.N8N_URL  || 'https://your-n8n.railway.app'

// Test credentials — must exist in the DB before running
const TEST_EMAIL    = __ENV.TEST_EMAIL    || 'admin@localhost'
const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'admin123'

// ─── Main virtual user scenario ──────────────────────────────────────────────

export default function virtualUser() {
  let token = null

  group('1. Auth — Login', () => {
    const start = Date.now()

    const res = http.post(
      `${N8N_URL}/webhook/auth/login`,
      JSON.stringify({ username: TEST_EMAIL, password: TEST_PASSWORD }),
      { headers: { 'Content-Type': 'application/json' } },
    )

    loginDuration.add(Date.now() - start)
    totalRequests.add(1)

    const ok = check(res, {
      'login status 200':      r => r.status === 200,
      'token present':         r => {
        try { return !!JSON.parse(r.body).token } catch { return false }
      },
    })

    if (ok) {
      try { token = JSON.parse(res.body).token } catch { /* noop */ }
    }
  })

  if (!token) return

  const headers = {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`,
  }

  sleep(1)

  group('2. Dashboard — Fetch appointments', () => {
    const res = http.get(`${N8N_URL}/webhook/appointments`, { headers })
    totalRequests.add(1)

    const ok = check(res, {
      'appointments status 200': r => r.status === 200,
      'response is array':       r => {
        try { return Array.isArray(JSON.parse(r.body)) } catch { return false }
      },
    })

    if (!ok) appointmentsFail.add(1)
  })

  sleep(1)

  group('3. Patients — List', () => {
    const res = http.get(`${N8N_URL}/webhook/patients`, { headers })
    totalRequests.add(1)

    check(res, {
      'patients status 200': r => r.status === 200,
    })
  })

  sleep(0.5)

  group('4. Settings — Fetch', () => {
    const res = http.get(`${N8N_URL}/webhook/settings`, { headers })
    totalRequests.add(1)

    check(res, {
      'settings status 200': r => r.status === 200,
    })
  })

  sleep(2)
}

// ─── Summary ─────────────────────────────────────────────────────────────────

export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    stdout: buildTextSummary(data),
  }
}

function buildTextSummary(data) {
  const m = data.metrics
  const p95 = m.http_req_duration?.values?.['p(95)']?.toFixed(0) ?? 'N/A'
  const p99 = m.http_req_duration?.values?.['p(99)']?.toFixed(0) ?? 'N/A'
  const failRate = ((m.http_req_failed?.values?.rate ?? 0) * 100).toFixed(2)
  const reqs = m.http_reqs?.values?.count ?? 0

  return `
╔════════════════════════════════════════╗
║   Asistente Psicológico — Load Test   ║
╠════════════════════════════════════════╣
║  Total requests:  ${String(reqs).padEnd(20)} ║
║  p(95) duration:  ${String(p95 + 'ms').padEnd(20)} ║
║  p(99) duration:  ${String(p99 + 'ms').padEnd(20)} ║
║  Error rate:      ${String(failRate + '%').padEnd(20)} ║
╚════════════════════════════════════════╝
`
}
