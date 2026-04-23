import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl space-y-8 text-center">
        <div className="space-y-3">
          <div className="text-4xl">🧠</div>
          <h1 className="text-2xl font-bold">Asistente Psicológico</h1>
          <p className="text-muted-foreground">
            Agenda tu cita de forma rápida y sencilla a través de WhatsApp.
          </p>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>¿Cómo funciona?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            {[
              { step: '1', text: 'Escribinos por WhatsApp' },
              { step: '2', text: 'Agendamos tu cita' },
              { step: '3', text: 'Confirmamos tu horario' },
              { step: '4', text: '¡Te esperamos!' }
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {step}
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full"
            onClick={() => window.open(`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER ?? ''}`, '_blank')}
          >
            📱 Escribinos por WhatsApp
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => window.location.href = '/capture'}
          >
            📅 Agendar Cita
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Horario de atención: Martes a Domingo, 9:00 a 18:00 hrs
        </p>
      </div>
    </div>
  )
}