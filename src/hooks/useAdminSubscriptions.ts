import { useQuery } from "@tanstack/react-query"

import { adminApi } from "@/lib/api-admin"

export function useAdminSubscriptions(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["admin-subscriptions", params],
    queryFn: async () => {
      const response = await adminApi.subscriptions.list(params)
      return response
    },
    staleTime: 30 * 1000,
  })
}

export function useAdminSubscription(id: number) {
  return useQuery({
    queryKey: ["admin-subscription", id],
    queryFn: async () => {
      const response = await adminApi.subscriptions.get(id)
      return response.data
    },
    enabled: !!id,
  })
}
