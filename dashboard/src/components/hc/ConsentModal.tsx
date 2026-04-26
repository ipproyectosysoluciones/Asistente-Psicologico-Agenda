import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'

interface Props {
  onConfirm: () => void
  onClose: () => void
  isLoading?: boolean
}

export function ConsentModal({ onConfirm, onClose, isLoading }: Props) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Consentimiento Informado</DialogTitle>
          <DialogDescription>
            Se requiere el consentimiento informado del paciente antes de registrar datos clínicos.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded border p-3 text-sm text-muted-foreground">
          Al marcar como firmado, confirma que el paciente ha leído, comprendido y firmado el
          formulario de consentimiento informado en formato físico o digital, conforme a la
          normativa aplicable.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Marcar como firmado'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
