import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export function useHCSection(patientId: string, section: string) {
  return useQuery({
    queryKey: ['hc', patientId, section],
    queryFn: () => api.get(`/hc/${section}/${patientId}`),
    enabled: !!patientId && !!section,
    staleTime: 5 * 60_000,
    retry: false,
  })
}
