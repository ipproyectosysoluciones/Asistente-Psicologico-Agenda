import { useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { HCSectionList } from '@/components/hc/HCSectionList'
import { HCSectionPanel } from '@/components/hc/HCSectionPanel'
import { ConsentModal } from '@/components/hc/ConsentModal'
import { useConsentGate } from '@/hooks/useConsentGate'
import api from '@/lib/api'

const TABS = ['overview', 'citas', 'hc'] as const
type Tab = typeof TABS[number]

const CONSENT_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  signed: 'Firmado',
  revoked: 'Revocado',
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const activeTab = (searchParams.get('tab') as Tab) ?? 'overview'
  const [activeSection, setActiveSection] = useState('demographics')
  const [showConsentModal, setShowConsentModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => api.get(`/patients/${id}`),
    enabled: !!id,
  })

  const patient = data as unknown as Record<string, unknown> | null
  const { hasConsent, recordConsent, isRecording } = useConsentGate(id!)

  const completedSections = new Set<string>(
    Object.entries({
      demographics: patient?.demographics_complete,
      chief_complaint: patient?.chief_complaint_complete,
      personal_history: patient?.personal_history_complete,
      diagnosis: patient?.diagnosis_complete,
      treatment_plan: patient?.treatment_plan_complete,
    })
      .filter(([, v]) => !!v)
      .map(([k]) => k)
  )

  function setTab(tab: Tab) {
    setSearchParams({ tab })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-muted-foreground">
        Paciente no encontrado.{' '}
        <button className="underline" onClick={() => navigate('/patients')}>Volver</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/patients')}
            className="mb-1 text-xs text-muted-foreground hover:underline"
          >
            ← Pacientes
          </button>
          <h2 className="text-xl font-semibold">
            {String(patient.first_name ?? '')} {String(patient.last_name ?? '')}
          </h2>
          <div className="text-sm text-muted-foreground">{patient.email as string}</div>
        </div>
        <Badge variant={patient.consent_status === 'signed' ? 'default' : 'secondary'}>
          {CONSENT_LABELS[patient.consent_status as string] ?? 'Pendiente'}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex border-b gap-0">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setTab(tab)}
            className={[
              'px-4 py-2 text-sm capitalize transition-colors',
              activeTab === tab
                ? 'border-b-2 border-primary font-medium'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {tab === 'hc' ? 'Historia Clínica' : tab === 'citas' ? 'Citas' : 'Resumen'}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Datos del Paciente</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <span className="text-muted-foreground">Teléfono</span>
            <span>{(patient.phone as string) || '—'}</span>
            <span className="text-muted-foreground">Consentimiento</span>
            <span>{CONSENT_LABELS[patient.consent_status as string] ?? '—'}</span>
            {!!(patient.consent_signed_at) && (
              <>
                <span className="text-muted-foreground">Firmado el</span>
                <span>{format(new Date(patient.consent_signed_at as string), 'dd MMM yyyy', { locale: es })}</span>
              </>
            )}
            <span className="text-muted-foreground">Paciente desde</span>
            <span>
              {patient.created_at
                ? format(new Date(patient.created_at as string), 'dd MMM yyyy', { locale: es })
                : '—'}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Citas tab — placeholder */}
      {activeTab === 'citas' && (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Historial de citas próximamente.
          </CardContent>
        </Card>
      )}

      {/* HC tab */}
      {activeTab === 'hc' && (
        <div className="grid grid-cols-[200px_1fr] gap-4">
          <div>
            {!hasConsent && (
              <div className="mb-3 rounded border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-800">
                Sin consentimiento
                <button
                  className="mt-1 block font-medium underline"
                  onClick={() => setShowConsentModal(true)}
                >
                  Registrar consentimiento
                </button>
              </div>
            )}
            <HCSectionList
              selected={activeSection}
              completedSections={completedSections}
              onSelect={setActiveSection}
            />
          </div>

          <Card>
            <CardContent className="pt-4">
              <HCSectionPanel
                section={activeSection}
                patientId={id!}
                hasConsent={hasConsent}
                onCancel={() => setActiveSection('demographics')}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {showConsentModal && (
        <ConsentModal
          onConfirm={() => { recordConsent(); setShowConsentModal(false) }}
          onClose={() => setShowConsentModal(false)}
          isLoading={isRecording}
        />
      )}
    </div>
  )
}
