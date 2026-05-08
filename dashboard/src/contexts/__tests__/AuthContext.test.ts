import { describe, it, expect } from 'vitest'
import { decodeJwtPayload } from '../AuthContext'

// Helper to build a JWT token for testing (without real signature)
function buildJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  return `${header}.${body}.fakesignature`
}

describe('decodeJwtPayload', () => {
  it('returns correct payload fields for a valid non-expired token', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const token = buildJwt({
      sub: 'user-123',
      psychologist_id: 'psych-456',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp,
    })

    const result = decodeJwtPayload(token)

    expect(result).not.toBeNull()
    expect(result?.sub).toBe('user-123')
    expect(result?.psychologist_id).toBe('psych-456')
    expect(result?.role).toBe('admin')
    expect(result?.exp).toBe(exp)
  })

  it('returns null for an expired token', () => {
    const token = buildJwt({
      sub: 'user-123',
      psychologist_id: 'psych-456',
      role: 'psychologist',
      iat: Math.floor(Date.now() / 1000) - 7200,
      exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
    })

    const result = decodeJwtPayload(token)

    expect(result).toBeNull()
  })

  it('returns null for a token with malformed base64 in the payload segment', () => {
    const result = decodeJwtPayload('header.!!!not_valid_base64!!!.signature')

    expect(result).toBeNull()
  })

  it('returns null for a string with wrong segment count (no dots)', () => {
    const result = decodeJwtPayload('notajwttoken')

    expect(result).toBeNull()
  })

  it('returns null for null/empty token', () => {
    expect(decodeJwtPayload('')).toBeNull()
    expect(decodeJwtPayload(null as unknown as string)).toBeNull()
  })
})
