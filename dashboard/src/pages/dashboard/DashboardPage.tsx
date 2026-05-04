import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, Users, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import api from '@/lib/api'

async function fetchStats() {
  return api.get('/stats')
}

async function fetchUpcoming() {
  return api.get('/appointments?status=scheduled&status=confirmed&limit=5&page=1')
}

function StatCard({ title, value, description, icon: Icon, accent = 'text-primary' }: {
  title: string
  value: number | string
  description?: string
  icon: React.ElementType
  accent?: string
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardDescription className="text-xs font-medium uppercase tracking-wide">{title}</CardDescription>
          <div className="pt-1 text-3xl font-bold">{value}</div>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className={`rounded-lg p-2 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
    </Card>
  )
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  scheduled: { label: 'Programada', variant: 'secondary' },
  confirmed: { label: 'Confirmada', variant: 'default' },
  completed: { label: 'Completada', variant: 'outline' },
  no_show: { label: 'Inasistencia', variant: 'destructive' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
}

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    retry: false,
  })

  const { data: upcomingData, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['appointments-upcoming'],
    queryFn: fetchUpcoming,
    retry: false,
  })

  const s = stats ?? {
    today_appointments: 0,
    month_completed: 0,
    total_patients: 0,
    new_patients_month: 0,
    month_noshow: 0,
    month_cancelled: 0,
  }

  const upcoming: Record<string, unknown>[] = upcomingData?.appointments ?? []

  return (
    <div className="space-y-6">
      <div className="text-lg font-semibold">Dashboard</div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
        ) : (
          <>
            <StatCard
              title="Citas Hoy"
              value={s.today_appointments}
              description="Programadas para hoy"
              icon={CalendarDays}
            />
            <StatCard
              title="Completadas (Mes)"
              value={s.month_completed}
              description="Este mes"
              icon={CheckCircle}
              accent="text-green-600"
            />
            <StatCard
              title="Total Pacientes"
              value={s.total_patients}
              description={`+${s.new_patients_month} este mes`}
              icon={Users}
              accent="text-amber-600"
            />
            <StatCard
              title="Inasistencias"
              value={s.month_noshow}
              description={`${s.month_cancelled} canceladas`}
              icon={XCircle}
              accent="text-red-500"
            />
          </>
        )}
      </div>

      {/* Upcoming appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Próximas citas</CardTitle>
          <CardDescription>Citas programadas o confirmadas</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loadingUpcoming ? (
            <div className="divide-y">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No hay citas próximas programadas.
            </div>
          ) : (
            <div className="divide-y">
              {upcoming.map((appt, i) => {
                const date = appt.scheduled_at ? new Date(appt.scheduled_at as string) : new Date()
                const status = STATUS_LABELS[appt.status as string] ?? STATUS_LABELS.scheduled
                const first = String(appt.first_name ?? '')
                const last = String(appt.last_name ?? '')
                return (
                  <div key={appt.id as string}>
                    {i > 0 && <Separator />}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs">{getInitials(first, last)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{first} {last}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(date, "EEEE d MMM · HH:mm 'hrs'", { locale: es })}
                        </p>
                      </div>
                      <Badge variant={status.variant} className="shrink-0">{status.label}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
