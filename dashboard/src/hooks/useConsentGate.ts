import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useConsentGate(patientId: string) {
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => api.get(`/patients/${patientId}`),
    enabled: !!patientId,
    staleTime: 60_000,
  })

  const hasConsent = !!(data as unknown as Record<string, unknown>)?.consent_signed_at

  const recordConsent = useMutation({
    mutationFn: () =>
      api.post(`/patients/${patientId}/consent`, { signed_at: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] })
    },
  })

  return {
    hasConsent,
    signedAt: (data as unknown as Record<string, unknown>)?.consent_signed_at as string | null,
    recordConsent: recordConsent.mutate,
    isRecording: recordConsent.isPending,
  }
}
