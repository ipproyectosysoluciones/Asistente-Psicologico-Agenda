import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface AuthState {
  isAuthenticated: boolean
  login: (user: string, pass: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

const AUTH_USER = import.meta.env.VITE_AUTH_USER
const AUTH_PASS = import.meta.env.VITE_AUTH_PASS

if (!AUTH_USER || !AUTH_PASS) {
  throw new Error('VITE_AUTH_USER and VITE_AUTH_PASS env vars are required')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('dashboard_auth') === 'true'
  })

  const login = useCallback((user: string, pass: string) => {
    if (user === AUTH_USER && pass === AUTH_PASS) {
      sessionStorage.setItem('dashboard_auth', 'true')
      setIsAuthenticated(true)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('dashboard_auth')
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}