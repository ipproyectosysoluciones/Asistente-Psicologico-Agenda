import { ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type ControlStatus = 'implemented' | 'partial' | 'pending'

interface ComplianceControl {
  id: string
  description: string
  status: ControlStatus
  notes?: string
}

interface ComplianceRegulation {
  code: string
  name: string
  jurisdiction: string
  overallStatus: ControlStatus
  controls: ComplianceControl[]
}

const STATUS_LABELS: Record<ControlStatus, string> = {
  implemented: 'Implementado',
  partial: 'Parcial',
  pending: 'Pendiente',
}

const STATUS_VARIANTS: Record<
  ControlStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  implemented: 'default',
  partial: 'secondary',
  pending: 'destructive',
}

const COMPLIANCE_CONTROLS: ComplianceRegulation[] = [
  {
    code: 'LFPDPPP',
    name: 'LFPDPPP',
    jurisdiction: 'México',
    overallStatus: 'partial',
    controls: [
      {
        id: 'mx-1',
        description: 'Derechos del titular — exportación de datos',
        status: 'partial',
        notes: 'Exportación GDPR existe pero sólo cubre 3/14 secciones HC; completo en Sprint 8b',
      },
      {
        id: 'mx-2',
        description: 'Gestión de consentimiento',
        status: 'implemented',
        notes: 'Tabla consentimientos + patients.consent_status implementados',
      },
      {
        id: 'mx-3',
        description: 'Seguridad de datos',
        status: 'implemented',
        notes: 'JWT auth + audit_log con triggers DB (Sprint 7b)',
      },
      {
        id: 'mx-4',
        description: 'Política de retención',
        status: 'partial',
        notes: 'data_retention_country existe; automatización de borrado pendiente (Sprint 8b)',
      },
    ],
  },
  {
    code: 'LEY1581',
    name: 'Ley 1581',
    jurisdiction: 'Colombia',
    overallStatus: 'partial',
    controls: [
      {
        id: 'co-1',
        description: 'Derechos del titular — acceso y portabilidad',
        status: 'partial',
        notes: 'Misma brecha que LFPDPPP — exportación incompleta hasta Sprint 8b',
      },
      {
        id: 'co-2',
        description: 'Consentimiento informado',
        status: 'implemented',
        notes: 'Misma infraestructura de consentimiento que LFPDPPP',
      },
    ],
  },
  {
    code: 'RGPD',
    name: 'RGPD / GDPR',
    jurisdiction: 'Unión Europea',
    overallStatus: 'partial',
    controls: [
      {
        id: 'eu-1',
        description: 'Derecho al olvido (eliminación)',
        status: 'partial',
        notes: 'Soft-delete existe; anulación de PII no automatizada',
      },
      {
        id: 'eu-2',
        description: 'Portabilidad de datos',
        status: 'partial',
        notes: '3 de 14 secciones HC exportadas; completo en Sprint 8b',
      },
      {
        id: 'eu-3',
        description: 'Trazabilidad / auditoría',
        status: 'implemented',
        notes: 'audit_log con old_data/new_data JSONB + triggers DB',
      },
    ],
  },
  {
    code: 'HIPAA',
    name: 'HIPAA',
    jurisdiction: 'USA',
    overallStatus: 'partial',
    controls: [
      {
        id: 'us-1',
        description: 'Controles de acceso',
        status: 'implemented',
        notes: 'Guardias de API basadas en roles en n8n + JWT auth',
      },
      {
        id: 'us-2',
        description: 'Registro de auditoría',
        status: 'implemented',
        notes: 'Tabla audit_log con old_data/new_data',
      },
      {
        id: 'us-3',
        description: 'Cifrado en tránsito',
        status: 'partial',
        notes: 'Depende de TLS en Railway — no forzado a nivel de app',
      },
      {
        id: 'us-4',
        description: 'PHI mínimo necesario',
        status: 'partial',
        notes: 'audit_log.old_data retiene PII completo indefinidamente (brecha conocida, Phase 6)',
      },
    ],
  },
]

function StatusBadge({ status }: { status: ControlStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}

export default function CompliancePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5" />
        <h1 className="text-lg font-semibold">Panel de Compliance</h1>
      </div>

      <p className="text-sm text-muted-foreground max-w-2xl">
        Estado actual de cumplimiento regulatorio. Los estados <strong>Parcial</strong> y{' '}
        <strong>Pendiente</strong> reflejan brechas reales — no declaraciones de cumplimiento.
      </p>

      {COMPLIANCE_CONTROLS.map(regulation => (
        <Card key={regulation.code}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {regulation.name}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({regulation.jurisdiction})
                </span>
              </CardTitle>
              <StatusBadge status={regulation.overallStatus} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Control</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regulation.controls.map(control => (
                  <TableRow key={control.id}>
                    <TableCell className="font-medium">{control.description}</TableCell>
                    <TableCell>
                      <StatusBadge status={control.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {control.notes ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
