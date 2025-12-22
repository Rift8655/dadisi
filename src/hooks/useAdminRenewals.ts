import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api-admin"

export function useAdminRenewals() {
  return useQuery({
    queryKey: ["admin-renewals"],
    queryFn: async () => {
      const response = await adminApi.renewals.list()
      return Array.isArray(response) ? response : (response as any)?.data || []
    },
    staleTime: 30 * 1000, // Tier 4: Dynamic - renewal status
  })
}

export function useRetryRenewal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      return await adminApi.renewals.retry(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-renewals"] })
    },
  })
}

export function useCancelRenewal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      return await adminApi.renewals.cancel(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-renewals"] })
    },
  })
}

export function useExtendRenewalGracePeriod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, days, note }: { id: number; days: number; note?: string }) => {
      return await adminApi.renewals.extendGracePeriod(id, { days, note })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-renewals"] })
    },
  })
}
