import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '@/lib/api'

async function fetchPatients() {
  return api.get('/patients')
}

async function createPatient(data: PatientForm) {
  return api.post('/patients', data)
}

interface PatientForm {
  first_name: string
  last_name: string
  email: string
  phone?: string
}

const CONSENT_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendiente', variant: 'secondary' },
  signed: { label: 'Firmado', variant: 'default' },
  revoked: { label: 'Revocado', variant: 'destructive' }
}

export default function PatientsPage() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients,
    retry: false
  })

  const createMutation = useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      setOpen(false)
    }
  })

  const patients = data?.patients ?? []

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createMutation.mutate({
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Pacientes</div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">+ Nuevo Paciente</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nuevo Paciente</DialogTitle>
                <DialogDescription>
                  Complete los datos del paciente. El consentimiento se solicitará después.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="first_name">Nombre(s)</Label>
                  <Input id="first_name" name="first_name" required placeholder="Juan" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last_name">Apellido(s)</Label>
                  <Input id="last_name" name="last_name" required placeholder="Pérez" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="juan@email.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+52 555 123 4567" />
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
          <CardTitle className="text-base">Todos los Pacientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Sesiones</TableHead>
                <TableHead>Consentimiento</TableHead>
                <TableHead>Desde</TableHead>
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
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay pacientes registrados.
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient: Record<string, unknown>) => {
                  const consent = CONSENT_LABELS[patient.consent_status as string] ?? CONSENT_LABELS.pending
                  return (
                    <TableRow key={patient.id as string}>
                      <TableCell>
                        <div className="font-medium">{patient.first_name} {patient.last_name}</div>
                        {patient.phone && (
                          <div className="text-xs text-muted-foreground">{patient.phone as string}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{patient.email as string}</TableCell>
                      <TableCell>{patient.total_sessions ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant={consent.variant}>{consent.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {patient.created_at
                          ? format(new Date(patient.created_at as string), 'dd MMM yyyy', { locale: es })
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/patients/${patient.id as string}?tab=hc`)}
                        >
                          Ver HC
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}