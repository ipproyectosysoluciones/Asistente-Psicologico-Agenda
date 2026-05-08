import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'

interface AppointmentsChartProps {
  data: { week: string; count: number }[]
}

const formatWeek = (week: string) =>
  new Intl.DateTimeFormat('es-AR', { month: 'short', day: 'numeric' }).format(new Date(week))

const formatTooltipLabel = (label: unknown) =>
  typeof label === 'string' ? formatWeek(label) : String(label)

export function AppointmentsChart({ data }: AppointmentsChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">Sin datos aún</p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <AreaChart data={data}>
        <XAxis dataKey="week" tickFormatter={formatWeek} tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip labelFormatter={formatTooltipLabel} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary) / 0.15)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
