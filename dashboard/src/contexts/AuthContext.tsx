import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

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
    const token = btoa(`${user}:${Date.now()}`)
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