import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

async function signJWT(userId: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const toB64url = (buf: ArrayBuffer) =>
    btoa(String.fromCharCode(...new Uint8Array(buf)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const now = Math.floor(Date.now() / 1000)
  const payload = btoa(JSON.stringify({ sub: userId, iat: now, exp: now + 28800 }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const input = `${header}.${payload}`
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(input))
  return `${input}.${toB64url(sig)}`
}

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  login: (user: string, pass: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

const TOKEN_KEY = 'auth_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY))

  const login = useCallback(async (user: string, pass: string): Promise<boolean> => {
    const expectedUser = import.meta.env.VITE_AUTH_USER
    const expectedPass = import.meta.env.VITE_AUTH_PASS
    if (!expectedUser || !expectedPass) return false
    if (user !== expectedUser || pass !== expectedPass) return false
    const jwtSecret = import.meta.env.VITE_JWT_SECRET
    if (!jwtSecret) return false
    const token = await signJWT(user, jwtSecret)
    sessionStorage.setItem(TOKEN_KEY, token)
    setToken(token)
    return true
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}