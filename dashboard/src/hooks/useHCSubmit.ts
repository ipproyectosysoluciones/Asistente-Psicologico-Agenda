import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useHCSubmit(patientId: string, section: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post(`/hc/${section}/${patientId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hc', patientId, section] })
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] })
    },
  })
}
