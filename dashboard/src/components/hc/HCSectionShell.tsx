import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Props {
  title: string
  lastUpdated?: string | null
  isComplete?: boolean
  hasConsent: boolean
  onSave: () => void
  onCancel: () => void
  isSaving?: boolean
  children: ReactNode
}

export function HCSectionShell({
  title, lastUpdated, isComplete, hasConsent, onSave, onCancel, isSaving, children
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Última actualización: {new Date(lastUpdated).toLocaleDateString('es-MX')}
            </p>
          )}
        </div>
        <Badge variant={isComplete ? 'default' : 'secondary'}>
          {isComplete ? 'Completo' : 'Pendiente'}
        </Badge>
      </div>

      {!hasConsent && (
        <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          Se requiere consentimiento informado para guardar datos del HC.
        </div>
      )}

      <div className="space-y-3">{children}</div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button size="sm" onClick={onSave} disabled={!hasConsent || isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  )
}
