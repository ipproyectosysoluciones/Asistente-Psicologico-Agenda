import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Brain,
  Calendar,
  CheckCircle2,
  Heart,
  MessageCircle,
  Phone,
  Star,
  Users,
  Video,
  Baby,
  ShieldCheck,
  Clock,
  MapPin,
  Mail,
} from 'lucide-react'

const CLINIC_NAME    = import.meta.env.VITE_CLINIC_NAME    ?? 'Consultorio Psicológico'
const CLINIC_TAGLINE = import.meta.env.VITE_CLINIC_TAGLINE ?? 'Atención profesional para tu bienestar mental'
const CLINIC_ADDRESS = import.meta.env.VITE_CLINIC_ADDRESS ?? ''
const CLINIC_PHONE   = import.meta.env.VITE_CLINIC_PHONE   ?? ''
const CLINIC_EMAIL   = import.meta.env.VITE_CLINIC_EMAIL   ?? ''
const WA_NUMBER      = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''

const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola, me gustaría agendar una cita')}`

// ─── NavBar ───────────────────────────────────────────────────

function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <span className="font-semibold text-foreground">{CLINIC_NAME}</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#servicios" className="hover:text-foreground transition-colors">Servicios</a>
          <a href="#como-funciona" className="hover:text-foreground transition-colors">¿Cómo funciona?</a>
          <a href="#precios" className="hover:text-foreground transition-colors">Tarifas</a>
          <a href="#contacto" className="hover:text-foreground transition-colors">Contacto</a>
        </nav>
        <Button asChild size="sm">
          <a href={WA_URL} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4 mr-1" />
            Agendar cita
          </a>
        </Button>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-background to-teal-50 dark:from-blue-950/20 dark:via-background dark:to-teal-950/20">
      <div className="container mx-auto px-4 md:px-8 py-20 md:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium mb-6">
            <ShieldCheck className="h-4 w-4" />
            Profesionales certificados · Presencial y online
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
            {CLINIC_TAGLINE}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Acompañamiento psicológico personalizado en un espacio seguro y confidencial.
            Agendá tu cita en minutos directo por WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="text-base">
              <a href={WA_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5 mr-2" />
                Escribinos por WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <a href="/capture">
                <Calendar className="h-5 w-5 mr-2" />
                Agendar en línea
              </a>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />Primera consulta sin compromiso
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />Confidencialidad garantizada
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />Respuesta en menos de 24h
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Services ─────────────────────────────────────────────────

const SERVICES = [
  {
    icon: Heart,
    title: 'Terapia Individual',
    description: 'Acompañamiento personalizado para ansiedad, depresión, estrés, duelo, autoestima y crecimiento personal.',
    tags: ['Ansiedad', 'Depresión', 'Autoestima'],
  },
  {
    icon: Users,
    title: 'Terapia de Pareja',
    description: 'Mejorá la comunicación, resolvé conflictos y fortalecé el vínculo afectivo con tu pareja.',
    tags: ['Comunicación', 'Conflictos', 'Vínculos'],
  },
  {
    icon: Baby,
    title: 'Niños y Adolescentes',
    description: 'Intervención especializada para dificultades emocionales, conductuales y de desarrollo.',
    tags: ['Conducta', 'Emociones', 'Desarrollo'],
  },
  {
    icon: Video,
    title: 'Consulta Online',
    description: 'Sesiones por videollamada con la misma calidad y confidencialidad que la consulta presencial.',
    tags: ['Videollamada', 'Flexible', 'Desde casa'],
  },
]

function Services() {
  return (
    <section id="servicios" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestros servicios</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Abordamos diferentes áreas de la salud mental con un enfoque integrador y basado en evidencia.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map(({ icon: Icon, title, description, tags }) => (
            <Card key={title} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map(tag => (
                    <span key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────

const STEPS = [
  { step: '01', title: 'Escribinos por WhatsApp', description: 'Mandá un mensaje y nuestro asistente te guía en el proceso de forma automática.' },
  { step: '02', title: 'Elegí día y horario', description: 'Seleccioná la fecha y hora disponible que mejor se adapte a tu agenda.' },
  { step: '03', title: 'Confirmá tu cita', description: 'Recibís confirmación inmediata con todos los detalles de tu consulta y un QR.' },
  { step: '04', title: 'Asistí a tu sesión', description: 'Presencial en el consultorio o por videollamada desde donde estés.' },
]

function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Cómo funciona?</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Agendar tu cita es simple y rápido. Sin llamadas, sin esperas.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map(({ step, title, description }, i) => (
            <div key={step} className="relative flex flex-col items-start gap-3">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-[calc(100%_-_1rem)] w-full h-px bg-border" />
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                {step}
              </div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Trust / Stats ────────────────────────────────────────────

const STATS = [
  { value: '+200', label: 'Pacientes atendidos' },
  { value: '5★', label: 'Valoración promedio' },
  { value: '+5', label: 'Años de experiencia' },
  { value: '100%', label: 'Confidencialidad' },
]

function Trust() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label} className="space-y-1">
              <div className="text-3xl font-bold">{value}</div>
              <div className="text-sm opacity-80">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────

const PRICING = [
  {
    name: 'Primera consulta',
    description: 'Evaluación inicial y plan de tratamiento',
    highlight: false,
    features: [
      'Sesión de 60 minutos',
      'Evaluación de necesidades',
      'Plan de tratamiento personalizado',
      'Presencial u online',
    ],
  },
  {
    name: 'Sesión de seguimiento',
    description: 'Continuidad del proceso terapéutico',
    highlight: true,
    features: [
      'Sesión de 50 minutos',
      'Seguimiento del proceso',
      'Recordatorio automático + QR',
      'Presencial u online',
    ],
  },
]

function Pricing() {
  return (
    <section id="precios" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Tarifas</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Consultá el valor de las sesiones directamente por WhatsApp.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PRICING.map(({ name, description, highlight, features }) => (
            <Card key={name} className={cn('relative overflow-hidden', highlight && 'border-primary shadow-lg')}>
              {highlight && (
                <div className="absolute top-0 right-0 rounded-bl-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Más frecuente
                </div>
              )}
              <CardContent className="p-6 space-y-5">
                <div>
                  <h3 className="font-semibold text-lg">{name}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <ul className="space-y-2">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full" variant={highlight ? 'default' : 'outline'}>
                  <a href={WA_URL} target="_blank" rel="noopener noreferrer">
                    Consultar tarifa
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950/20 dark:to-blue-950/20">
      <div className="container mx-auto px-4 md:px-8 text-center">
        <Star className="h-10 w-10 text-primary mx-auto mb-4" />
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Empezá hoy tu proceso</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
          El primer paso es el más importante. Agendá tu consulta inicial y comenzá a sentirte mejor.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="text-base">
            <a href={WA_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5 mr-2" />
              Agendar por WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base">
            <a href="/capture">
              <Calendar className="h-5 w-5 mr-2" />
              Formulario de cita
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────

function Footer() {
  return (
    <footer id="contacto" className="border-t py-12 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-semibold">{CLINIC_NAME}</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Profesionales certificados comprometidos con tu bienestar mental.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Servicios</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Terapia Individual</li>
              <li>Terapia de Pareja</li>
              <li>Niños y Adolescentes</li>
              <li>Consulta Online</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Contacto</h4>
            <ul className="space-y-2 text-sm">
              {WA_NUMBER && (
                <li>
                  <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </li>
              )}
              {CLINIC_PHONE && (
                <li>
                  <a href={`tel:${CLINIC_PHONE}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Phone className="h-4 w-4" /> {CLINIC_PHONE}
                  </a>
                </li>
              )}
              {CLINIC_EMAIL && (
                <li>
                  <a href={`mailto:${CLINIC_EMAIL}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="h-4 w-4" /> {CLINIC_EMAIL}
                  </a>
                </li>
              )}
              {CLINIC_ADDRESS && (
                <li className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" /> {CLINIC_ADDRESS}
                </li>
              )}
              <li className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" /> Mar–Dom, 9:00–18:00
              </li>
            </ul>
          </div>
        </div>
        <Separator />
        <div className="pt-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} {CLINIC_NAME}. Todos los derechos reservados.</span>
          <span>Información confidencial protegida · Ley 1581 de 2012</span>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Hero />
        <Services />
        <HowItWorks />
        <Trust />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
