import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('Attempt login:', user, pass)
    
    try {
      const ok = login(user, pass)
      console.log('Login success:', ok)
      
      if (ok) {
        window.location.href = '/dashboard'
      } else {
        setError(true)
      }
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 300, padding: 24, borderRadius: 8, background: 'white', border: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 36 }}>🧠</div>
          <h1 style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>Panel de Control</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Ingresá tus credenciales</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Usuario</label>
          <input
            type="text"
            value={user}
            onChange={e => { setUser(e.target.value); setError(false) }}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
            placeholder="admin"
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Contraseña</label>
          <input
            type="password"
            value={pass}
            onChange={e => { setPass(e.target.value); setError(false) }}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p style={{ fontSize: 13, color: '#ef4444', textAlign: 'center', marginBottom: 16 }}>
            Credenciales incorrectas
          </p>
        )}

        <button
          type="submit"
          style={{ width: '100%', padding: '10px 16px', backgroundColor: '#6366f1', color: 'white', borderRadius: 6, border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
        >
          Ingresar
        </button>
      </form>
    </div>
  )
}