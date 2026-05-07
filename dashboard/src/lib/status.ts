export const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  scheduled:  { label: 'Programada',   className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300' },
  confirmed:  { label: 'Confirmada',   className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300' },
  completed:  { label: 'Completada',   className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300' },
  no_show:    { label: 'Inasistencia', className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300' },
  cancelled:  { label: 'Cancelada',    className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300' },
}

export function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.scheduled
}
