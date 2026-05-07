import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { Search, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import api from '@/lib/api'
import { getStatusConfig } from '@/lib/status'

type Appointment = Record<string, unknown>

const STATUS_TABS = [
  { value: '', label: 'Todas' },
  { value: 'scheduled', label: 'Programada' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'completed', label: 'Completada' },
  { value: 'no_show', label: 'Inasistencia' },
  { value: 'cancelled', label: 'Cancelada' },
]

const PAGE_SIZE = 20

async function fetchAppointments(page: number, status: string, search: string) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  })
  if (status) params.set('status', status)
  if (search) params.set('search', search)
  return api.get(`/appointments?${params.toString()}`)
}

async function fetchPatients() {
  return api.get('/patients')
}

async function createAppointment(data: AppointmentForm) {
  return api.post('/appointments', data)
}

interface AppointmentForm {
  patient_id: string
  scheduled_at: string
  appointment_type: string
  duration_minutes: number
}

function AppointmentDetailDialog({ appt, onClose }: { appt: Appointment; onClose: () => void }) {
  const date = new Date(appt.scheduled_at as string)
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalle de Cita</DialogTitle>
          <DialogDescription>
            {String(appt.first_name ?? '')} {String(appt.last_name ?? '')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Fecha</span>
            <span>{format(date, 'dd MMM yyyy', { locale: es })}</span>
            <span className="text-muted-foreground">Hora</span>
            <span>{format(date, 'HH:mm')} hrs</span>
            <span className="text-muted-foreground">Tipo</span>
            <span className="capitalize">{appt.appointment_type as string}</span>
            <span className="text-muted-foreground">Duración</span>
            <span>{String(appt.duration_minutes ?? '')} min</span>
            <span className="text-muted-foreground">Estado</span>
            <Badge variant="outline" className={getStatusConfig(appt.status as string).className}>
              {getStatusConfig(appt.status as string).label}
            </Badge>
          </div>
          {(appt.email as string | null) && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Email</span>
                <span>{appt.email as string}</span>
                {(appt.session_notes as string | null) && (
                  <>
                    <span className="text-muted-foreground">Notas</span>
                    <span>{appt.session_notes as string}</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AppointmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const statusFilter = searchParams.get('status') ?? ''
  const searchQuery = searchParams.get('search') ?? ''

  const [open, setOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
  const [searchInput, setSearchInput] = useState(searchQuery)
  const queryClient = useQueryClient()

  // Debounce search input into URL
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        if (searchInput) { next.set('search', searchInput); next.set('page', '1') }
        else { next.delete('search'); next.set('page', '1') }
        return next
      })
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput, setSearchParams])

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', page, statusFilter, searchQuery],
    queryFn: () => fetchAppointments(page, statusFilter, searchQuery),
    retry: false,
  })

  const { data: patientsData } = useQuery({
    queryKey: ['patients-all'],
    queryFn: fetchPatients,
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setOpen(false)
      toast.success('Cita creada exitosamente')
    },
    onError: () => toast.error('No se pudo crear la cita'),
  })

  const appts: Appointment[] = appointments?.appointments ?? []
  const patients: Record<string, unknown>[] = patientsData?.patients ?? []
  const totalPages = (appointments as any)?.total_pages ?? 1
  const totalCount = (appointments as any)?.total_count ?? 0

  function setStatus(value: string) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set('status', value)
      else next.delete('status')
      next.set('page', '1')
      return next
    })
  }

  function setPage(p: number) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const scheduledAt = `${formData.get('scheduled_date')}T${formData.get('scheduled_time')}:00`
    const type = formData.get('appointment_type') as string
    createMutation.mutate({
      patient_id: formData.get('patient_id') as string,
      scheduled_at: scheduledAt,
      appointment_type: type,
      duration_minutes: type === 'primera vez' ? 90 : 50,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Citas</div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><CalendarDays className="h-4 w-4 mr-1.5" />Nueva Cita</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nueva Cita</DialogTitle>
                <DialogDescription>Programe una cita para un paciente existente.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="patient_id">Paciente</Label>
                  <select id="patient_id" name="patient_id" required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                    <option value="">Seleccionar paciente...</option>
                    {patients.map(p => (
                      <option key={p.id as string} value={p.id as string}>
                        {String(p.first_name ?? '')} {String(p.last_name ?? '')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="scheduled_date">Fecha</Label>
                  <Input id="scheduled_date" name="scheduled_date" type="date" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="scheduled_time">Hora</Label>
                  <Input id="scheduled_time" name="scheduled_time" type="time" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="appointment_type">Tipo de Consulta</Label>
                  <select id="appointment_type" name="appointment_type" required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                    <option value="seguimiento">Seguimiento (50 min)</option>
                    <option value="primera vez">Primera vez (90 min)</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        {/* Filters */}
        <CardHeader className="space-y-3 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Todas las Citas
              {totalCount > 0 && (
                <span className="ml-2 text-muted-foreground font-normal text-sm">({totalCount})</span>
              )}
            </CardTitle>
          </div>
          {/* Search */}
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente..."
              className="pl-8"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>
          {/* Status tabs */}
          <div className="flex flex-wrap gap-1">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatus(tab.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : appts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <CalendarDays className="h-8 w-8 opacity-30" />
                      <span>No hay citas{statusFilter ? ` con estado "${getStatusConfig(statusFilter).label}"` : ''}{searchQuery ? ` para "${searchQuery}"` : ''}.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                appts.map((appt) => {
                  const status = getStatusConfig(appt.status as string)
                  const date = appt.scheduled_at ? new Date(appt.scheduled_at as string) : new Date()
                  return (
                    <TableRow key={appt.id as string}>
                      <TableCell>
                        <div className="font-medium">{format(date, 'dd MMM yyyy', { locale: es })}</div>
                        <div className="text-xs text-muted-foreground">{format(date, 'HH:mm')} hrs</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{String(appt.first_name ?? '')} {String(appt.last_name ?? '')}</div>
                        <div className="text-xs text-muted-foreground">{appt.email as string}</div>
                      </TableCell>
                      <TableCell className="capitalize">{appt.appointment_type as string}</TableCell>
                      <TableCell>{String(appt.duration_minutes ?? '')} min</TableCell>
                      <TableCell><Badge variant="outline" className={status.className}>{status.label}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedAppt(appt)}>Ver</Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
              <span>Página {page} de {totalPages}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>Anterior</Button>
                <Button size="sm" variant="outline" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>Siguiente</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedAppt && (
        <AppointmentDetailDialog appt={selectedAppt} onClose={() => setSelectedAppt(null)} />
      )}
    </div>
  )
}
