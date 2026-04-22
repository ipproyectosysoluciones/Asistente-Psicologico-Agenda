import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Users, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

async function fetchStats() {
  const res = await fetch('/api/stats', {
    baseURL: import.meta.env.VITE_API_URL || ''
  })
  if (!res.ok) throw new Error('Error fetching stats')
  return res.json()
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

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    retry: false
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-lg font-semibold">Dashboard</div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      </div>
    )
  }

  const s = stats ?? {
    today_appointments: 0,
    month_completed: 0,
    total_patients: 0,
    new_patients_month: 0,
    month_noshow: 0,
    month_cancelled: 0
  }

  return (
    <div className="space-y-6">
      <div className="text-lg font-semibold">Dashboard</div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </div>
  )
}