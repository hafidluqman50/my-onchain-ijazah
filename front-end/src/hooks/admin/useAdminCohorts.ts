import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminCreateCohort, adminListCohorts, type CohortItem } from '@/lib/api'

export const adminCohortsQueryKey = ['admin-cohorts'] as const

export function useAdminCohorts() {
  return useQuery({
    queryKey: adminCohortsQueryKey,
    queryFn: adminListCohorts,
  })
}

export function useCreateCohort(onCreated?: (cohort: CohortItem) => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminCreateCohort,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: adminCohortsQueryKey })
      onCreated?.(data.cohort)
    },
  })
}
