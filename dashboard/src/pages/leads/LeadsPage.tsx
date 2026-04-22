import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Mail, Phone, Tag, Plus, Send, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

async function fetchLeads() {
  const res = await fetch('/api/leads', {
    baseURL: import.meta.env.VITE_API_URL || ''
  })
  if (!res.ok) throw new Error('Error fetching leads')
  return res.json()
}

async function createLead(data: LeadForm) {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    baseURL: import.meta.env.VITE_API_URL || ''
  })
  if (!res.ok) throw new Error('Error creating lead')
  return res.json()
}

interface LeadForm {
  first_name: string
  last_name?: string
  email?: string
  phone: string
  source?: string
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'outline' }> = {
  new: { label: 'Nuevo', variant: 'secondary' },
  contacted: { label: 'Contactado', variant: 'default' },
  qualified: { label: 'Calificado', variant: 'outline' },
  converted: { label: 'Convertido', variant: 'default' },
  lost: { label: 'Perdido', variant: 'destructive' }
}

export default function LeadsPage() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  
  const { data, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads,
    retry: false
  })

  const createMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      setOpen(false)
    }
  })

  const leads = data?.leads ?? []

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createMutation.mutate({
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      source: 'dashboard'
    })
  }

  const stats = {
    total: leads.length,
    new: leads.filter((l: Record<string, unknown>) => l.status === 'new').length,
    contacted: leads.filter((l: Record<string, unknown>) => l.status === 'contacted').length,
    converted: leads.filter((l: Record<string, unknown>) => l.status === 'converted').length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Leads</div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" />Nuevo Lead</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nuevo Lead</DialogTitle>
                <DialogDescription>Agregá un lead manualmente.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="first_name">Nombre *</Label>
                  <Input id="first_name" name="first_name" required placeholder="Juan" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input id="last_name" name="last_name" placeholder="Pérez" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input id="phone" name="phone" type="tel" required placeholder="+52 555..." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="juan@email.com" />
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

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase">Total Leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase">Nuevos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase">Contactados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contacted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase">Convertidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.converted}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Todos los Leads</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Score</TableHead>
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
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay leads registrados.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead: Record<string, unknown>) => {
                  const status = STATUS_LABELS[lead.status as string] ?? STATUS_LABELS.new
                  return (
                    <TableRow key={lead.id as string}>
                      <TableCell>
                        <div className="font-medium">{lead.first_name} {lead.last_name}</div>
                        <div className="text-xs text-muted-foreground">{lead.created_at ? new Date(lead.created_at as string).toLocaleDateString('es-MX') : ''}</div>
                      </TableCell>
                      <TableCell>
                        {lead.phone && <div className="text-sm">{lead.phone as string}</div>}
                        {lead.email && <div className="text-xs text-muted-foreground">{lead.email as string}</div>}
                      </TableCell>
                      <TableCell className="text-sm capitalize">{lead.source as string}</TableCell>
                      <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                      <TableCell>{lead.lead_score ?? 0}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Contactar</Button>
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