import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import api from '@/lib/api'

interface LoginResponse {
  token: string
  expiresAt: number
}

interface LoginResult {
  success: boolean
  error?: string
}

export interface JwtPayload {
  sub: string
  psychologist_id: string
  role: string
  iat: number
  exp: number
}

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  jwtRole: 'admin' | 'psychologist' | null
  jwtPsychologistId: string | null
  login: (username: string, password: string) => Promise<LoginResult>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

const TOKEN_KEY = 'auth_token'
const INACTIVITY_MS = 60 * 60 * 1000

export function decodeJwtPayload(token: string): JwtPayload | null {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    // Base64url decode: replace URL-safe chars, add padding
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4)
    const json = atob(padded)
    const payload = JSON.parse(json) as JwtPayload
    if (payload.exp < Date.now() / 1000) return null
    return payload
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_KEY)
  )
  const [jwtPayload, setJwtPayload] = useState<JwtPayload | null>(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY)
    return stored ? decodeJwtPayload(stored) : null
  })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setJwtPayload(null)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => logout(), INACTIVITY_MS)
  }, [logout])

  // Validate token on mount — if stored token is expired/malformed, logout
  useEffect(() => {
    if (!token) return
    const decoded = decodeJwtPayload(token)
    if (!decoded) {
      logout()
      return
    }
    setJwtPayload(decoded)
    resetTimer()
    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keydown', resetTimer)
    window.addEventListener('click', resetTimer)
    window.addEventListener('scroll', resetTimer)
    return () => {
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keydown', resetTimer)
      window.removeEventListener('click', resetTimer)
      window.removeEventListener('scroll', resetTimer)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [token, resetTimer, logout])

  const login = useCallback(
    async (username: string, password: string): Promise<LoginResult> => {
      try {
        const res = await api.post<unknown, LoginResponse>('/auth/login', {
          username,
          password,
        })
        sessionStorage.setItem(TOKEN_KEY, res.token)
        setToken(res.token)
        const decoded = decodeJwtPayload(res.token)
        setJwtPayload(decoded)
        return { success: true }
      } catch (err: unknown) {
        const axiosErr = err as {
          response?: { data?: { error?: string } }
        }
        const msg = axiosErr.response?.data?.error ?? 'login_failed'
        return { success: false, error: msg }
      }
    },
    []
  )

  const jwtRole = jwtPayload?.role ?? null
  const jwtPsychologistId = jwtPayload?.psychologist_id ?? null

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!token, token, jwtRole, jwtPsychologistId, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
