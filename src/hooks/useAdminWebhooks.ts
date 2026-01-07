import { useQuery } from "@tanstack/react-query"

import type { AdminWebhookEvent } from "@/types/admin"
import { adminApi } from "@/lib/api-admin"

export function useAdminWebhooks(params: Record<string, any> = {}) {
  return useQuery<any>({
    queryKey: ["admin-webhooks", params],
    queryFn: async () => {
      return await adminApi.webhooks.list(params)
    },
    staleTime: 30 * 1000,
  })
}
