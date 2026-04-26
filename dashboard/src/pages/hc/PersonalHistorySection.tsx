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

export function PersonalHistorySection({ patientId, hasConsent, onCancel }: Props) {
  const { data, isLoading } = useHCSection(patientId, 'personal_history')
  const submit = useHCSubmit(patientId, 'personal_history')
  const existing = (data as unknown as Record<string, unknown>) ?? {}

  const [form, setForm] = useState({
    medical_conditions: '',
    current_medications: '',
    allergies: '',
    previous_psychiatric_treatment: false,
    psychiatric_treatment_details: '',
    alcohol_use: '',
    tobacco_use: '',
    drug_use: '',
  })

  useEffect(() => {
    if (existing.id) {
      setForm({
        medical_conditions: (existing.medical_conditions as string) ?? '',
        current_medications: (existing.current_medications as string) ?? '',
        allergies: (existing.allergies as string) ?? '',
        previous_psychiatric_treatment: !!(existing.previous_psychiatric_treatment),
        psychiatric_treatment_details: (existing.psychiatric_treatment_details as string) ?? '',
        alcohol_use: (existing.alcohol_use as string) ?? '',
        tobacco_use: (existing.tobacco_use as string) ?? '',
        drug_use: (existing.drug_use as string) ?? '',
      })
    }
  }, [existing.id])

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  if (isLoading) return <div className="text-sm text-muted-foreground">Cargando...</div>

  return (
    <HCSectionShell
      title="Historia Presentada"
      lastUpdated={existing.created_at as string}
      isComplete={!!existing.id}
      hasConsent={hasConsent}
      onSave={() => submit.mutate(form)}
      onCancel={onCancel}
      isSaving={submit.isPending}
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <Label>Condiciones médicas</Label>
          <textarea
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            value={form.medical_conditions}
            onChange={e => set('medical_conditions', e.target.value)}
            placeholder="Enfermedades crónicas, cirugías..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Medicación actual</Label>
            <Input value={form.current_medications} onChange={e => set('current_medications', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Alergias</Label>
            <Input value={form.allergies} onChange={e => set('allergies', e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="prev-psych"
            checked={form.previous_psychiatric_treatment}
            onChange={e => set('previous_psychiatric_treatment', e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="prev-psych">Tratamiento psiquiátrico previo</Label>
        </div>
        {form.previous_psychiatric_treatment && (
          <div className="space-y-1">
            <Label>Detalles del tratamiento previo</Label>
            <textarea
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              value={form.psychiatric_treatment_details}
              onChange={e => set('psychiatric_treatment_details', e.target.value)}
            />
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          {(['alcohol_use', 'tobacco_use', 'drug_use'] as const).map(field => (
            <div key={field} className="space-y-1">
              <Label>{field === 'alcohol_use' ? 'Alcohol' : field === 'tobacco_use' ? 'Tabaco' : 'Drogas'}</Label>
              <select
                value={form[field]}
                onChange={e => set(field, e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">—</option>
                <option value="ninguno">Ninguno</option>
                <option value="ocasional">Ocasional</option>
                <option value="moderado">Moderado</option>
                <option value="frecuente">Frecuente</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </HCSectionShell>
  )
}
