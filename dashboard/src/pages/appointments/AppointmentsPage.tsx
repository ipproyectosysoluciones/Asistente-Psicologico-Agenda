import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
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

type Appointment = Record<string, unknown>

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
            <span className="capitalize">{appt.status as string}</span>
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

async function fetchAppointments() {
  return api.get('/appointments')
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

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  scheduled: { label: 'Programada', variant: 'secondary' },
  confirmed: { label: 'Confirmada', variant: 'default' },
  completed: { label: 'Completada', variant: 'outline' },
  no_show: { label: 'Inasistencia', variant: 'destructive' },
  cancelled: { label: 'Cancelada', variant: 'destructive' }
}

export default function AppointmentsPage() {
  const [open, setOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
  const queryClient = useQueryClient()
  
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: fetchAppointments,
    retry: false
  })

  const { data: patientsData } = useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients,
    retry: false
  })

  const createMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setOpen(false)
    }
  })

  const appts = appointments?.appointments ?? []
  const patients = patientsData?.patients ?? []

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const scheduledAt = `${formData.get('scheduled_date')}T${formData.get('scheduled_time')}:00`
    const type = formData.get('appointment_type') as string
    
    createMutation.mutate({
      patient_id: formData.get('patient_id') as string,
      scheduled_at: scheduledAt,
      appointment_type: type,
      duration_minutes: type === 'primera vez' ? 90 : 50
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Citas</div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">+ Nueva Cita</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nueva Cita</DialogTitle>
                <DialogDescription>
                  Programe una nueva cita para un paciente existente.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="patient_id">Paciente</Label>
                  <select 
                    id="patient_id" 
                    name="patient_id" 
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="">Seleccionar paciente...</option>
                    {patients.map((p: Record<string, unknown>) => (
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
                  <select 
                    id="appointment_type" 
                    name="appointment_type" 
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="seguimiento">Seguimiento (50 min)</option>
                    <option value="primera vez">Primera vez (90 min)</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Todas las Citas</CardTitle>
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
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay citas registradas.
                  </TableCell>
                </TableRow>
              ) : (
                appts.map((appt: Record<string, unknown>) => {
                  const status = STATUS_LABELS[appt.status as string] ?? STATUS_LABELS.scheduled
                  const date = appt.scheduled_at ? new Date(appt.scheduled_at as string) : new Date()
                  return (
                    <TableRow key={appt.id as string}>
                      <TableCell>
                        <div className="font-medium">{format(date, 'dd MMM yyyy', { locale: es })}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(date, 'HH:mm')} hrs
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{String(appt.first_name ?? '')} {String(appt.last_name ?? '')}</div>
                        <div className="text-xs text-muted-foreground">{appt.email as string}</div>
                      </TableCell>
                      <TableCell className="capitalize">{appt.appointment_type as string}</TableCell>
                      <TableCell>{String(appt.duration_minutes ?? '')} min</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedAppt(appt)}>Ver</Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedAppt && (
        <AppointmentDetailDialog
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
        />
      )}
    </div>
  )
}