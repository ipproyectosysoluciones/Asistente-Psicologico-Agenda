import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function CapturePage() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

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
    } catch {
      toast.error('Ocurrió un error. Intentalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">¡Gracias!</CardTitle>
            <CardDescription>Te contactaremos pronto.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" onClick={() => navigate('/landing')}>
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Contáctanos</CardTitle>
          <CardDescription>Escríbenos y te contactaremos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre *</Label>
              <Input
                id="first_name"
                type="text"
                name="first_name"
                required
                placeholder="Tu nombre"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                type="tel"
                name="phone"
                required
                placeholder="+52 555..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="tu@email.com"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <Send className="h-4 w-4" />
              {loading ? 'Enviando...' : 'Enviar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
