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

export function ChiefComplaintSection({ patientId, hasConsent, onCancel }: Props) {
  const { data, isLoading } = useHCSection(patientId, 'chief_complaint')
  const submit = useHCSubmit(patientId, 'chief_complaint')
  const existing = (data as unknown as Record<string, unknown>) ?? {}

  const [form, setForm] = useState({ complaint_text: '', symptom_duration: '', symptom_onset: '' })

  useEffect(() => {
    if (existing.id) {
      setForm({
        complaint_text: (existing.complaint_text as string) ?? '',
        symptom_duration: (existing.symptom_duration as string) ?? '',
        symptom_onset: (existing.symptom_onset as string) ?? '',
      })
    }
  }, [existing.id])

  if (isLoading) return <div className="text-sm text-muted-foreground">Cargando...</div>

  return (
    <HCSectionShell
      title="Motivo de Consulta"
      lastUpdated={existing.created_at as string}
      isComplete={!!existing.id}
      hasConsent={hasConsent}
      onSave={() => submit.mutate(form)}
      onCancel={onCancel}
      isSaving={submit.isPending}
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <Label>Motivo de consulta *</Label>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            value={form.complaint_text}
            onChange={e => setForm(f => ({ ...f, complaint_text: e.target.value }))}
            placeholder="Describa el motivo principal de consulta..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Duración de síntomas</Label>
            <Input
              value={form.symptom_duration}
              onChange={e => setForm(f => ({ ...f, symptom_duration: e.target.value }))}
              placeholder="Ej: 3 meses"
            />
          </div>
          <div className="space-y-1">
            <Label>Inicio de síntomas</Label>
            <Input
              value={form.symptom_onset}
              onChange={e => setForm(f => ({ ...f, symptom_onset: e.target.value }))}
              placeholder="Ej: Tras pérdida de empleo"
            />
          </div>
        </div>
      </div>
    </HCSectionShell>
  )
}
