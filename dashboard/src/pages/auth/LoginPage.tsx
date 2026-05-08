import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const { login } = useAuth()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    setSubmitting(true)
    try {
      const result = await login(user, pass)
      if (result.success) {
        window.location.href = '/dashboard'
      } else {
        setError(result.error ?? 'Credenciales incorrectas')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Panel de Control</CardTitle>
          <CardDescription>Ingresá tus credenciales</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">Usuario</Label>
              <Input
                id="user"
                type="text"
                value={user}
                onChange={e => { setUser(e.target.value); setError(null) }}
                placeholder="admin"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pass">Contraseña</Label>
              <Input
                id="pass"
                type="password"
                value={pass}
                onChange={e => { setPass(e.target.value); setError(null) }}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Iniciando sesión...' : 'Ingresar'}
            </Button>

            {error !== null && (
              <p className="text-destructive text-sm text-center mt-2">{error}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
