import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HCSectionShell } from '@/components/hc/HCSectionShell'
import { useHCSection } from '@/hooks/useHCSection'
import { useHCSubmit } from '@/hooks/useHCSubmit'

interface Props {
  patientId: string
  hasConsent: boolean
  onCancel: () => void
}

export function IdentificationSection({ patientId, hasConsent, onCancel }: Props) {
  const { data, isLoading } = useHCSection(patientId, 'demographics')
  const submit = useHCSubmit(patientId, 'demographics')

  const existing = (data as unknown as Record<string, unknown>) ?? {}

  const [form, setForm] = useState({
    occupation: '',
    marital_status: '',
    number_of_children: '',
    education_level: '',
    religion: '',
  })

  useEffect(() => {
    if (existing.id) {
      setForm({
        occupation: (existing.occupation as string) ?? '',
        marital_status: (existing.marital_status as string) ?? '',
        number_of_children: String(existing.number_of_children ?? ''),
        education_level: (existing.education_level as string) ?? '',
        religion: (existing.religion as string) ?? '',
      })
    }
  }, [existing.id])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSave() {
    submit.mutate({
      ...form,
      number_of_children: form.number_of_children ? parseInt(form.number_of_children, 10) : null,
    })
  }

  if (isLoading) return <div className="text-sm text-muted-foreground">Cargando...</div>

  return (
    <HCSectionShell
      title="Identificación del Paciente"
      lastUpdated={existing.created_at as string}
      isComplete={!!existing.id}
      hasConsent={hasConsent}
      onSave={handleSave}
      onCancel={onCancel}
      isSaving={submit.isPending}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Ocupación</Label>
          <Input value={form.occupation} onChange={e => set('occupation', e.target.value)} placeholder="Ej: Docente" />
        </div>
        <div className="space-y-1">
          <Label>Estado Civil</Label>
          <select
            value={form.marital_status}
            onChange={e => set('marital_status', e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">Seleccionar...</option>
            <option value="soltero">Soltero/a</option>
            <option value="casado">Casado/a</option>
            <option value="divorciado">Divorciado/a</option>
            <option value="viudo">Viudo/a</option>
            <option value="union_libre">Unión libre</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>Hijos (cantidad)</Label>
          <Input
            type="number"
            min="0"
            value={form.number_of_children}
            onChange={e => set('number_of_children', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Nivel educativo</Label>
          <select
            value={form.education_level}
            onChange={e => set('education_level', e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">Seleccionar...</option>
            <option value="primaria">Primaria</option>
            <option value="secundaria">Secundaria</option>
            <option value="terciario">Terciario</option>
            <option value="universitario">Universitario</option>
            <option value="posgrado">Posgrado</option>
          </select>
        </div>
        <div className="space-y-1 col-span-2">
          <Label>Religión / Espiritualidad</Label>
          <Input value={form.religion} onChange={e => set('religion', e.target.value)} placeholder="Opcional" />
        </div>
      </div>
    </HCSectionShell>
  )
}
