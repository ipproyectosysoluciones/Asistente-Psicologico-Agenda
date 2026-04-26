import { IdentificationSection } from '@/pages/hc/IdentificationSection'
import { ChiefComplaintSection } from '@/pages/hc/ChiefComplaintSection'
import { PersonalHistorySection } from '@/pages/hc/PersonalHistorySection'
import { DiagnosisSection } from '@/pages/hc/DiagnosisSection'
import { TreatmentPlanSection } from '@/pages/hc/TreatmentPlanSection'

interface Props {
  section: string
  patientId: string
  hasConsent: boolean
  onCancel: () => void
}

export function HCSectionPanel({ section, patientId, hasConsent, onCancel }: Props) {
  switch (section) {
    case 'demographics':
      return <IdentificationSection patientId={patientId} hasConsent={hasConsent} onCancel={onCancel} />
    case 'chief_complaint':
      return <ChiefComplaintSection patientId={patientId} hasConsent={hasConsent} onCancel={onCancel} />
    case 'personal_history':
      return <PersonalHistorySection patientId={patientId} hasConsent={hasConsent} onCancel={onCancel} />
    case 'diagnosis':
      return <DiagnosisSection patientId={patientId} hasConsent={hasConsent} onCancel={onCancel} />
    case 'treatment_plan':
      return <TreatmentPlanSection patientId={patientId} hasConsent={hasConsent} onCancel={onCancel} />
    default:
      return <div className="text-sm text-muted-foreground">Seleccioná una sección del HC.</div>
  }
}
