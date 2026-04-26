import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { HCSectionShell } from '@/components/hc/HCSectionShell'
import { useHCSection } from '@/hooks/useHCSection'
import { useHCSubmit } from '@/hooks/useHCSubmit'

interface Props {
  patientId: string
  hasConsent: boolean
  onCancel: () => void
}

export function TreatmentPlanSection({ patientId, hasConsent, onCancel }: Props) {
  const { data, isLoading } = useHCSection(patientId, 'treatment_plan')
  const submit = useHCSubmit(patientId, 'treatment_plan')
  const existing = (data as unknown as Record<string, unknown>) ?? {}

  const [form, setForm] = useState({
    short_term_goals: '',
    long_term_goals: '',
    therapy_modality: '',
    planned_duration_weeks: '',
    session_frequency: '',
    interventions: '',
  })
  const [objectiveInput, setObjectiveInput] = useState('')
  const [objectives, setObjectives] = useState<string[]>([])

  useEffect(() => {
    if (existing.id) {
      setForm({
        short_term_goals: (existing.short_term_goals as string) ?? '',
        long_term_goals: (existing.long_term_goals as string) ?? '',
        therapy_modality: (existing.therapy_modality as string) ?? '',
        planned_duration_weeks: String(existing.planned_duration_weeks ?? ''),
        session_frequency: (existing.session_frequency as string) ?? '',
        interventions: (existing.interventions as string) ?? '',
      })
      if (existing.objectives) {
        try {
          setObjectives(JSON.parse(existing.objectives as string))
        } catch {
          setObjectives([])
        }
      }
    }
  }, [existing.id])

  function addObjective() {
    const trimmed = objectiveInput.trim()
    if (!trimmed) return
    setObjectives(o => [...o, trimmed])
    setObjectiveInput('')
  }

  function removeObjective(i: number) {
    setObjectives(o => o.filter((_, idx) => idx !== i))
  }

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSave() {
    submit.mutate({
      ...form,
      objectives: JSON.stringify(objectives),
      planned_duration_weeks: form.planned_duration_weeks ? parseInt(form.planned_duration_weeks, 10) : null,
    })
  }

  if (isLoading) return <div className="text-sm text-muted-foreground">Cargando...</div>

  return (
    <HCSectionShell
      title="Plan de Tratamiento"
      lastUpdated={existing.created_at as string}
      isComplete={!!existing.id}
      hasConsent={hasConsent}
      onSave={handleSave}
      onCancel={onCancel}
      isSaving={submit.isPending}
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <Label>Objetivos terapéuticos</Label>
          <div className="flex gap-2">
            <Input
              value={objectiveInput}
              onChange={e => setObjectiveInput(e.target.value)}
              placeholder="Agregar objetivo..."
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addObjective())}
            />
            <button
              type="button"
              onClick={addObjective}
              className="rounded-md border px-3 text-sm hover:bg-muted"
            >
              +
            </button>
          </div>
          {objectives.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {objectives.map((o, i) => (
                <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeObjective(i)}>
                  {o} ×
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Modalidad terapéutica</Label>
            <Input value={form.therapy_modality} onChange={e => set('therapy_modality', e.target.value)} placeholder="Ej: TCC" />
          </div>
          <div className="space-y-1">
            <Label>Frecuencia de sesiones</Label>
            <Input value={form.session_frequency} onChange={e => set('session_frequency', e.target.value)} placeholder="Ej: Semanal" />
          </div>
          <div className="space-y-1">
            <Label>Duración estimada (semanas)</Label>
            <Input type="number" min="1" value={form.planned_duration_weeks} onChange={e => set('planned_duration_weeks', e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Objetivos a corto plazo</Label>
          <textarea
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            value={form.short_term_goals}
            onChange={e => set('short_term_goals', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Objetivos a largo plazo</Label>
          <textarea
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            value={form.long_term_goals}
            onChange={e => set('long_term_goals', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Intervenciones planificadas</Label>
          <textarea
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            value={form.interventions}
            onChange={e => set('interventions', e.target.value)}
          />
        </div>
      </div>
    </HCSectionShell>
  )
}
