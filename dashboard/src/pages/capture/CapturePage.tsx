import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import api from '@/lib/api'

export default function CapturePage() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const phone = formData.get('phone') as string

    try {
      await api.post('/leads', {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        phone,
        email: formData.get('email'),
        source: 'web_capture'
      })

      setSubmitted(true)
    } catch (err) {
      setError('Intentalo de nuevo más tarde')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>¡Gracias!</h1>
          <p style={{ color: '#64748b', marginBottom: 24 }}>Te contactaremos pronto.</p>
          <button
            onClick={() => navigate('/landing')}
            style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400, padding: 24, borderRadius: 8, background: 'white', border: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 36 }}>💬</div>
          <h1 style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>Contáctanos</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Escríbenos y te contactaremos</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Nombre *</label>
          <input
            type="text"
            name="first_name"
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
            placeholder="Tu nombre"
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Teléfono *</label>
          <input
            type="tel"
            name="phone"
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
            placeholder="+52 555..."
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email</label>
          <input
            type="email"
            name="email"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
            placeholder="tu@email.com"
          />
        </div>

        {error && (
          <p style={{ fontSize: 13, color: '#ef4444', textAlign: 'center', marginBottom: 16 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px 16px', backgroundColor: '#6366f1', color: 'white', borderRadius: 6, border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Send className="h-4 w-4" />
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}