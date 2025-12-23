import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { payoutsAdminApi } from "@/lib/api-admin"

export const adminPayoutKeys = {
  all: ["admin-payouts"] as const,
  lists: () => [...adminPayoutKeys.all, "list"] as const,
  list: (params: any) => [...adminPayoutKeys.lists(), params] as const,
  details: () => [...adminPayoutKeys.all, "detail"] as const,
  detail: (id: number) => [...adminPayoutKeys.details(), id] as const,
}

export function useAdminPayouts(params: { status?: string; page?: number; per_page?: number } = {}) {
  return useQuery({
    queryKey: adminPayoutKeys.list(params),
    queryFn: async () => {
      const response = await payoutsAdminApi.list(params)
      return {
        payouts: response.data,
        pagination: response.meta?.pagination || response,
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useAdminPayout(id: number | null) {
  return useQuery({
    queryKey: id ? adminPayoutKeys.detail(id) : ["admin-payouts", "detail", 0],
    queryFn: async () => {
      if (!id) return null
      const response = await payoutsAdminApi.get(id)
      return response.data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useAdminPayoutMutations() {
  const queryClient = useQueryClient()

  const approveMutation = useMutation({
    mutationFn: (id: number) => payoutsAdminApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPayoutKeys.all })
    },
  })

  const completeMutation = useMutation({
    mutationFn: ({ id, reference }: { id: number; reference?: string }) =>
      payoutsAdminApi.complete(id, { reference }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPayoutKeys.all })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      payoutsAdminApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPayoutKeys.all })
    },
  })

  return {
    approve: approveMutation,
    complete: completeMutation,
    reject: rejectMutation,
  }
}
