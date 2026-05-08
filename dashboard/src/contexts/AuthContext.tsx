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

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  login: (username: string, password: string) => Promise<LoginResult>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

const TOKEN_KEY = 'auth_token'
const INACTIVITY_MS = 60 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_KEY)
  )
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => logout(), INACTIVITY_MS)
  }, [logout])

  useEffect(() => {
    if (!token) return
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
  }, [token, resetTimer])

  const login = useCallback(
    async (username: string, password: string): Promise<LoginResult> => {
      try {
        const res = await api.post<unknown, LoginResponse>('/auth/login', {
          username,
          password,
        })
        sessionStorage.setItem(TOKEN_KEY, res.token)
        setToken(res.token)
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

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!token, token, login, logout }}
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
