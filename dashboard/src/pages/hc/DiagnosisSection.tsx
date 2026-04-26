import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HCSectionShell } from '@/components/hc/HCSectionShell'
import { useHCSection } from '@/hooks/useHCSection'
import { useHCSubmit } from '@/hooks/useHCSubmit'

const DSM5_CODES = [
  { code: 'F32.1', name: 'Trastorno depresivo mayor, episodio único' },
  { code: 'F33.1', name: 'Trastorno depresivo mayor, recurrente' },
  { code: 'F41.1', name: 'Trastorno de ansiedad generalizada' },
  { code: 'F40.1', name: 'Fobia social (Trastorno de ansiedad social)' },
  { code: 'F42.2', name: 'Trastorno obsesivo-compulsivo' },
  { code: 'F43.1', name: 'Trastorno de estrés postraumático' },
  { code: 'F43.0', name: 'Reacción aguda a estrés' },
  { code: 'F60.3', name: 'Trastorno límite de la personalidad' },
  { code: 'F20.9', name: 'Esquizofrenia' },
  { code: 'F31.9', name: 'Trastorno bipolar' },
]

interface Props {
  patientId: string
  hasConsent: boolean
  onCancel: () => void
}

export function DiagnosisSection({ patientId, hasConsent, onCancel }: Props) {
  const { data, isLoading } = useHCSection(patientId, 'diagnosis')
  const submit = useHCSubmit(patientId, 'diagnosis')
  const existing = (data as unknown as Record<string, unknown>) ?? {}

  const [form, setForm] = useState({
    primary_diagnosis_code: '',
    primary_diagnosis_name: '',
    diagnosis_description: '',
    comorbid_diagnoses: '',
    severity: '',
    diagnostic_impression: '',
  })

  useEffect(() => {
    if (existing.id) {
      setForm({
        primary_diagnosis_code: (existing.primary_diagnosis_code as string) ?? '',
        primary_diagnosis_name: (existing.primary_diagnosis_name as string) ?? '',
        diagnosis_description: (existing.diagnosis_description as string) ?? '',
        comorbid_diagnoses: (existing.comorbid_diagnoses as string) ?? '',
        severity: (existing.severity as string) ?? '',
        diagnostic_impression: (existing.diagnostic_impression as string) ?? '',
      })
    }
  }, [existing.id])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleCodeChange(code: string) {
    const match = DSM5_CODES.find(d => d.code === code)
    setForm(f => ({
      ...f,
      primary_diagnosis_code: code,
      primary_diagnosis_name: match?.name ?? f.primary_diagnosis_name,
    }))
  }

  if (isLoading) return <div className="text-sm text-muted-foreground">Cargando...</div>

  return (
    <HCSectionShell
      title="Diagnóstico"
      lastUpdated={existing.created_at as string}
      isComplete={!!existing.id}
      hasConsent={hasConsent}
      onSave={() => submit.mutate(form)}
      onCancel={onCancel}
      isSaving={submit.isPending}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Código diagnóstico (DSM-5/CIE-10)</Label>
            <select
              value={form.primary_diagnosis_code}
              onChange={e => handleCodeChange(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">Seleccionar código...</option>
              {DSM5_CODES.map(d => (
                <option key={d.code} value={d.code}>{d.code}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Nombre del diagnóstico</Label>
            <Input
              value={form.primary_diagnosis_name}
              onChange={e => set('primary_diagnosis_name', e.target.value)}
              placeholder="Nombre o descripción"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Descripción del diagnóstico</Label>
          <textarea
            className="flex min-h-[70px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            value={form.diagnosis_description}
            onChange={e => set('diagnosis_description', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Comorbilidades</Label>
            <Input value={form.comorbid_diagnoses} onChange={e => set('comorbid_diagnoses', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Severidad</Label>
            <select
              value={form.severity}
              onChange={e => set('severity', e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">—</option>
              <option value="leve">Leve</option>
              <option value="moderado">Moderado</option>
              <option value="grave">Grave</option>
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <Label>Impresión diagnóstica</Label>
          <textarea
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            value={form.diagnostic_impression}
            onChange={e => set('diagnostic_impression', e.target.value)}
          />
        </div>
      </div>
    </HCSectionShell>
  )
}
