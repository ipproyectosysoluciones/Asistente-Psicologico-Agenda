import { Badge } from '@/components/ui/badge'

const SECTIONS = [
  { key: 'demographics',    label: 'Identificación' },
  { key: 'chief_complaint', label: 'Motivo de Consulta' },
  { key: 'personal_history', label: 'Historia Presentada' },
  { key: 'diagnosis',       label: 'Diagnóstico' },
  { key: 'treatment_plan',  label: 'Plan de Tratamiento' },
]

interface Props {
  selected: string
  completedSections: Set<string>
  onSelect: (section: string) => void
}

export function HCSectionList({ selected, completedSections, onSelect }: Props) {
  const identificationDone = completedSections.has('demographics')

  return (
    <div className="space-y-1">
      {SECTIONS.map((s, i) => {
        const locked = i > 0 && !identificationDone
        const isComplete = completedSections.has(s.key)
        const isSelected = selected === s.key

        return (
          <button
            key={s.key}
            onClick={() => !locked && onSelect(s.key)}
            disabled={locked}
            className={[
              'w-full rounded px-3 py-2 text-left text-sm transition-colors',
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted',
              locked ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
            ].join(' ')}
          >
            <div className="flex items-center justify-between">
              <span>{s.label}</span>
              <Badge variant={isComplete ? 'default' : 'secondary'} className="text-xs">
                {isComplete ? '✓' : '—'}
              </Badge>
            </div>
            {locked && (
              <div className="mt-0.5 text-xs opacity-70">Completar Identificación primero</div>
            )}
          </button>
        )
      })}
    </div>
  )
}
