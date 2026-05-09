import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { jwtRole } = useAuth()

  if (jwtRole !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
