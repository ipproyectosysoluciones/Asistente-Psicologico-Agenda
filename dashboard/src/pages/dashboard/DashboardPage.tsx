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
import { getStatusConfig } from '@/lib/status'
import { AppointmentsChart } from './AppointmentsChart'

interface StatsResponse {
  today_appointments: number
  month_completed: number
  month_noshow: number
  month_cancelled: number
  total_patients: number
  new_patients_month: number
  weekly_appointments: { week: string; count: number }[]
}

interface UpcomingResponse {
  appointments: Record<string, unknown>[]
}

async function fetchStats(): Promise<StatsResponse> {
  return api.get('/stats')
}

async function fetchUpcoming(): Promise<UpcomingResponse> {
  return api.get('/appointments?status=scheduled,confirmed&limit=5&page=1')
}

function StatCard({ title, value, description, icon: Icon, iconBg = 'bg-primary/10', iconColor = 'text-primary' }: {
  title: string
  value: number | string
  description?: string
  icon: React.ElementType
  iconBg?: string
  iconColor?: string
}) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardDescription className="text-xs font-medium uppercase tracking-wide">{title}</CardDescription>
          <div className="text-3xl font-bold">{value}</div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </CardHeader>
    </Card>
  )
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
    weekly_appointments: [] as { week: string; count: number }[],
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
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              title="Completadas (Mes)"
              value={s.month_completed}
              description="Este mes"
              icon={CheckCircle}
              iconBg="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600 dark:text-green-400"
            />
            <StatCard
              title="Total Pacientes"
              value={s.total_patients}
              description={`+${s.new_patients_month} este mes`}
              icon={Users}
              iconBg="bg-amber-100 dark:bg-amber-900/30"
              iconColor="text-amber-600 dark:text-amber-400"
            />
            <StatCard
              title="Inasistencias"
              value={s.month_noshow}
              description={`${s.month_cancelled} canceladas`}
              icon={XCircle}
              iconBg="bg-red-100 dark:bg-red-900/30"
              iconColor="text-red-500 dark:text-red-400"
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
                const status = getStatusConfig(appt.status as string)
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
                      <Badge variant="outline" className={`shrink-0 ${status.className}`}>{status.label}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointments trend chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Citas — últimas 8 semanas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading
            ? <Skeleton className="h-64 w-full" />
            : <AppointmentsChart data={s.weekly_appointments ?? []} />
          }
        </CardContent>
      </Card>
    </div>
  )
}
