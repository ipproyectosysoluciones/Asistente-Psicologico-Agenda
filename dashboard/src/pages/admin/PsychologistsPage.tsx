import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { Users2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface Psychologist {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'psychologist'
  is_active: boolean
  created_at: string
}

interface CreatePsychologistInput {
  email: string
  password: string
  role: 'admin' | 'psychologist'
}

interface UpdatePsychologistInput {
  id: string
  email?: string
  role?: 'admin' | 'psychologist'
  is_active?: boolean
}

async function fetchPsychologists(): Promise<{ psychologists: Psychologist[] }> {
  return api.get('/webhook/psychologists')
}

async function createPsychologist(data: CreatePsychologistInput) {
  return api.post('/webhook/psychologists', data)
}

async function updatePsychologist(data: UpdatePsychologistInput) {
  return api.put('/webhook/psychologists', data)
}

async function deactivatePsychologist(id: string) {
  return api.delete(`/webhook/psychologists`, { data: { id } })
}

const EMPTY_CREATE: CreatePsychologistInput = { email: '', password: '', role: 'psychologist' }
const EMPTY_UPDATE: UpdatePsychologistInput = { id: '', email: '', role: 'psychologist', is_active: true }

export default function PsychologistsPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreatePsychologistInput>(EMPTY_CREATE)
  const [editForm, setEditForm] = useState<UpdatePsychologistInput>(EMPTY_UPDATE)
  const [deactivateTarget, setDeactivateTarget] = useState<Psychologist | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['psychologists'],
    queryFn: fetchPsychologists,
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: createPsychologist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psychologists'] })
      setCreateOpen(false)
      setCreateForm(EMPTY_CREATE)
      toast.success('Psicólogo creado exitosamente')
    },
    onError: () => toast.error('No se pudo crear el psicólogo'),
  })

  const editMutation = useMutation({
    mutationFn: updatePsychologist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psychologists'] })
      setEditOpen(false)
      toast.success('Psicólogo actualizado exitosamente')
    },
    onError: () => toast.error('No se pudo actualizar el psicólogo'),
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivatePsychologist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psychologists'] })
      setDeactivateOpen(false)
      setDeactivateTarget(null)
      toast.success('Psicólogo desactivado exitosamente')
    },
    onError: () => toast.error('No se pudo desactivar el psicólogo'),
  })

  const psychologists = data?.psychologists ?? []

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    createMutation.mutate(createForm)
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    editMutation.mutate(editForm)
  }

  function openEdit(p: Psychologist) {
    setEditForm({ id: p.id, email: p.email, role: p.role, is_active: p.is_active })
    setEditOpen(true)
  }

  function openDeactivate(p: Psychologist) {
    setDeactivateTarget(p)
    setDeactivateOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users2 className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Gestión de Psicólogos</h1>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Nuevo Psicólogo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateSubmit}>
              <DialogHeader>
                <DialogTitle>Nuevo Psicólogo</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-email">Email</Label>
                  <Input
                    id="create-email"
                    type="email"
                    required
                    value={createForm.email}
                    onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="psicologo@ejemplo.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-password">Contraseña</Label>
                  <Input
                    id="create-password"
                    type="password"
                    required
                    value={createForm.password}
                    onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-role">Rol</Label>
                  <select
                    id="create-role"
                    value={createForm.role}
                    onChange={e =>
                      setCreateForm(f => ({
                        ...f,
                        role: e.target.value as 'admin' | 'psychologist',
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="psychologist">Psicólogo</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creando...' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <TableRow key={i} data-testid="skeleton-row">
                {[...Array(6)].map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : psychologists.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                No hay psicólogos registrados.
              </TableCell>
            </TableRow>
          ) : (
            psychologists.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.full_name}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>
                  <Badge variant={p.role === 'admin' ? 'default' : 'secondary'}>
                    {p.role === 'admin' ? 'Admin' : 'Psicólogo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={p.is_active ? 'default' : 'destructive'}>
                    {p.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(p.created_at), 'dd MMM yyyy', { locale: es })}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => openDeactivate(p)}
                  >
                    Desactivar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Editar Psicólogo</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email ?? ''}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Rol</Label>
                <select
                  id="edit-role"
                  value={editForm.role}
                  onChange={e =>
                    setEditForm(f => ({
                      ...f,
                      role: e.target.value as 'admin' | 'psychologist',
                    }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="psychologist">Psicólogo</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="edit-active"
                  type="checkbox"
                  checked={editForm.is_active ?? true}
                  onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="edit-active">Activo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar desactivación</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            ¿Estás seguro de que querés desactivar a{' '}
            <span className="font-medium text-foreground">
              {deactivateTarget?.full_name ?? deactivateTarget?.email}
            </span>
            ? Esta acción se puede revertir.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeactivateOpen(false)
                setDeactivateTarget(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deactivateMutation.isPending}
              onClick={() => {
                if (deactivateTarget) deactivateMutation.mutate(deactivateTarget.id)
              }}
            >
              {deactivateMutation.isPending ? 'Desactivando...' : 'Desactivar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
