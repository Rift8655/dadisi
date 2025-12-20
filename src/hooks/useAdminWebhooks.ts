import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api-admin"
import type { AdminWebhookEvent } from "@/types/admin"

export function useAdminWebhooks() {
  return useQuery<AdminWebhookEvent[]>({
    queryKey: ["admin-webhooks"],
    queryFn: async () => {
      const response = await adminApi.webhooks.list()
      return Array.isArray(response) ? response : (response as any)?.data || []
    },
    staleTime: 30 * 1000, // Tier 4: Dynamic - incoming webhook events
  })
}
