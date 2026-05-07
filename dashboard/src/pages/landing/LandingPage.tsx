import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Brain, Calendar, CheckCircle2, Heart, MessageCircle, Phone,
  Star, Users, Video, Baby, ShieldCheck, Clock, MapPin, Mail,
  Menu, X, ChevronDown, ChevronUp, Lock,
} from 'lucide-react'

const CLINIC_NAME    = import.meta.env.VITE_CLINIC_NAME    ?? 'Consultorio Psicológico'
const CLINIC_TAGLINE = import.meta.env.VITE_CLINIC_TAGLINE ?? 'Atención profesional para tu bienestar mental'
const CLINIC_ADDRESS = import.meta.env.VITE_CLINIC_ADDRESS ?? ''
const CLINIC_PHONE   = import.meta.env.VITE_CLINIC_PHONE   ?? ''
const CLINIC_EMAIL   = import.meta.env.VITE_CLINIC_EMAIL   ?? ''
const WA_NUMBER      = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''

const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola, me gustaría agendar una cita')}`

// ─── WhatsApp FAB ─────────────────────────────────────────────

function WhatsAppFAB() {
  if (!WA_NUMBER) return null
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatear por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-xl hover:bg-[#20b858] transition-all duration-200 hover:scale-105 active:scale-95"
    >
      <svg className="h-5 w-5 fill-current shrink-0" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.737 5.487 2.027 7.79L.057 30.942a.75.75 0 00.914.914l7.152-1.97A15.94 15.94 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.5c-2.5 0-4.84-.666-6.86-1.828l-.49-.293-4.527 1.248 1.25-4.527-.293-.49A13.44 13.44 0 012.5 16C2.5 8.544 8.544 2.5 16 2.5S29.5 8.544 29.5 16 23.456 29.5 16 29.5zm7.388-9.884c-.395-.197-2.337-1.152-2.699-1.284-.361-.131-.624-.197-.888.197-.264.395-1.02 1.284-1.25 1.548-.23.264-.46.296-.855.099-.395-.197-1.667-.615-3.175-1.96-1.173-1.046-1.966-2.338-2.196-2.732-.23-.395-.024-.609.173-.806.178-.177.395-.46.593-.691.198-.23.263-.395.395-.658.132-.264.066-.494-.033-.691-.1-.198-.888-2.141-1.217-2.932-.32-.77-.647-.665-.888-.677l-.757-.013c-.264 0-.691.099-.1.526-.329.428-1.25 1.416-1.25 3.455 0 2.04 1.48 3.98 1.678 4.244.198.264 2.73 4.165 6.615 5.84.924.399 1.645.637 2.207.815.927.295 1.77.254 2.437.154.743-.112 2.288-.935 2.61-1.838.323-.902.323-1.675.226-1.838-.098-.163-.361-.264-.756-.46z" />
      </svg>
      <span className="text-sm font-semibold">WhatsApp</span>
    </a>
  )
}

// ─── NavBar ───────────────────────────────────────────────────

function NavBar() {
  const [open, setOpen] = useState(false)

  const navLinks = [
    { href: '#servicios', label: 'Servicios' },
    { href: '#como-funciona', label: '¿Cómo funciona?' },
    { href: '#testimonios', label: 'Testimonios' },
    { href: '#precios', label: 'Tarifas' },
    { href: '#contacto', label: 'Contacto' },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <span className="font-semibold text-foreground">{CLINIC_NAME}</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden md:flex">
            <a href={WA_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 mr-1" />
              Agendar cita
            </a>
          </Button>
          <a href="/login" className="hidden md:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2">
            <Lock className="h-3 w-3" />
            Admin
          </a>
          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-1 shadow-lg">
          {navLinks.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 border-t space-y-2">
            <Button asChild className="w-full" size="sm">
              <a href={WA_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" />
                Agendar por WhatsApp
              </a>
            </Button>
            <a href="/login" className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1">
              <Lock className="h-3 w-3" />
              Acceso profesional
            </a>
          </div>
        </div>
      )}
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-background to-teal-50 dark:from-blue-950/20 dark:via-background dark:to-teal-950/20">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 h-[400px] w-[400px] rounded-full bg-teal-400/5 blur-3xl" />

      <div className="container relative mx-auto px-4 md:px-8 py-20 md:py-32">
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

          {/* Social proof avatars */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {['VA', 'CM', 'LR', 'JP'].map(init => (
                <div key={init} className="h-8 w-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-semibold text-primary">
                  {init}
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">+200 pacientes</span> ya confían en nosotros
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
    color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    title: 'Terapia Individual',
    description: 'Acompañamiento personalizado para ansiedad, depresión, estrés, duelo, autoestima y crecimiento personal.',
    tags: ['Ansiedad', 'Depresión', 'Autoestima'],
  },
  {
    icon: Users,
    color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
    title: 'Terapia de Pareja',
    description: 'Mejorá la comunicación, resolvé conflictos y fortalecé el vínculo afectivo con tu pareja.',
    tags: ['Comunicación', 'Conflictos', 'Vínculos'],
  },
  {
    icon: Baby,
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    title: 'Niños y Adolescentes',
    description: 'Intervención especializada para dificultades emocionales, conductuales y de desarrollo.',
    tags: ['Conducta', 'Emociones', 'Desarrollo'],
  },
  {
    icon: Video,
    color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
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
          <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">Lo que ofrecemos</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestros servicios</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Abordamos diferentes áreas de la salud mental con un enfoque integrador y basado en evidencia.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map(({ icon: Icon, color, title, description, tags }) => (
            <Card key={title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 space-y-4">
                <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110', color)}>
                  <Icon className="h-6 w-6" />
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
  {
    step: '01',
    icon: MessageCircle,
    title: 'Escribinos por WhatsApp',
    description: 'Mandá un mensaje y nuestro asistente te guía en el proceso de forma automática y amigable.',
  },
  {
    step: '02',
    icon: Calendar,
    title: 'Elegí día y horario',
    description: 'Seleccioná la fecha y hora disponible que mejor se adapte a tu agenda. Sin esperas.',
  },
  {
    step: '03',
    icon: CheckCircle2,
    title: 'Confirmá tu cita',
    description: 'Recibís confirmación inmediata con todos los detalles de tu consulta y un código QR.',
  },
  {
    step: '04',
    icon: Heart,
    title: 'Comenzá tu proceso',
    description: 'Asistí a tu sesión presencial en el consultorio o por videollamada desde donde estés.',
  },
]

function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">Proceso simple</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Cómo funciona?</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Agendar tu cita es simple y rápido. Sin llamadas, sin esperas, sin complicaciones.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map(({ step, icon: Icon, title, description }, i) => (
            <div key={step} className="relative flex flex-col items-start gap-3">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-[calc(100%-1rem)] w-full h-px bg-gradient-to-r from-border to-transparent" />
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0 shadow-md">
                {step}
              </div>
              <div className="p-2 rounded-lg bg-primary/5">
                <Icon className="h-5 w-5 text-primary" />
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

// ─── Testimonials ─────────────────────────────────────────────

const TESTIMONIALS = [
  {
    initials: 'VA',
    name: 'Valentina A.',
    service: 'Terapia Individual',
    stars: 5,
    text: 'Encontré el espacio que necesitaba para trabajar mi ansiedad. El proceso de agendar por WhatsApp fue súper sencillo y la atención es cálida y profesional desde el primer momento.',
  },
  {
    initials: 'CM',
    name: 'Carlos M.',
    service: 'Terapia de Pareja',
    stars: 5,
    text: 'Mi pareja y yo llevábamos tiempo queriendo buscar ayuda. Nos sorprendió lo fácil que fue coordinar la cita y lo mucho que avanzamos desde la primera sesión.',
  },
  {
    initials: 'LP',
    name: 'Laura P.',
    service: 'Psicología Infantil',
    stars: 5,
    text: 'Mi hijo de 9 años cambió notablemente en pocas semanas. El profesional supo conectar con él de una forma que me sorprendió. Los recordatorios automáticos son un detalle genial.',
  },
]

function Testimonials() {
  return (
    <section id="testimonios" className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">Lo que dicen nuestros pacientes</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Testimonios</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Historias reales de personas que dieron el primer paso.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ initials, name, service, stars, text }) => (
            <Card key={name} className="relative overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex text-amber-400">
                  {[...Array(stars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t">
                  <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{service}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
          <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">Inversión en tu bienestar</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Tarifas</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Consultá el valor de las sesiones directamente por WhatsApp. Sin sorpresas.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PRICING.map(({ name, description, highlight, features }) => (
            <Card key={name} className={cn('relative overflow-hidden transition-shadow', highlight ? 'border-primary shadow-lg hover:shadow-xl' : 'hover:shadow-md')}>
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

// ─── FAQ ──────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: '¿Cuánto dura cada sesión?',
    a: 'La primera consulta dura aproximadamente 60 minutos. Las sesiones de seguimiento tienen una duración de 50 minutos.',
  },
  {
    q: '¿Las sesiones son presenciales, online o ambas?',
    a: 'Ofrecemos ambas modalidades. Podés optar por sesiones presenciales en el consultorio o videollamadas desde la comodidad de tu hogar, con la misma calidad y confidencialidad.',
  },
  {
    q: '¿Cómo agendo mi primera cita?',
    a: 'Es muy sencillo: escribinos por WhatsApp y nuestro asistente te guiará paso a paso para elegir el día, horario y modalidad que mejor se adapte a vos.',
  },
  {
    q: '¿Qué pasa si no puedo asistir a mi sesión?',
    a: 'Podés cancelar o reprogramar tu cita con al menos 24 horas de anticipación sin costo. Avisanos por WhatsApp y lo coordinamos.',
  },
  {
    q: '¿Mis datos y conversaciones son confidenciales?',
    a: 'Absolutamente. Todo lo que compartas con tu psicólogo/a está protegido por el secreto profesional y cumple con la legislación vigente (Ley 1581 en Colombia, RGPD en España, HIPAA en EE.UU.).',
  },
  {
    q: '¿Trabajan con obras sociales o seguros médicos?',
    a: 'Consultá directamente por WhatsApp para conocer las coberturas disponibles según tu ubicación y el plan que tenés.',
  },
]

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">Preguntas frecuentes</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Resolvemos tus dudas</h2>
        </div>
        <div className="space-y-1">
          {FAQ_ITEMS.map(({ q, a }, i) => (
            <div key={i} className="border-b last:border-b-0">
              <button
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span>{q}</span>
                {openIdx === i
                  ? <ChevronUp className="h-4 w-4 shrink-0 text-primary" />
                  : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                }
              </button>
              {openIdx === i && (
                <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-teal-50/50 dark:from-primary/10 dark:via-background dark:to-teal-950/20">
      <div className="container mx-auto px-4 md:px-8 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Heart className="h-7 w-7 text-primary" />
        </div>
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
              Profesionales certificados comprometidos con tu bienestar mental y emocional.
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
        <Testimonials />
        <Trust />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  )
}
