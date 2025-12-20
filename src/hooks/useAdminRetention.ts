import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api-admin"
import type { RetentionSetting } from "@/types"

export function useAdminRetentionSettings() {
  return useQuery<RetentionSetting[]>({
    queryKey: ["admin-retention-settings"],
    queryFn: async () => {
      const data = await adminApi.retention.list()
      return Array.isArray(data) ? data : (data as any)?.data || []
    },
    staleTime: Infinity, // Tier 1: Static config - only changes via admin mutation
  })
}

export function useUpdateRetentionSetting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await adminApi.retention.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-retention-settings"] })
    },
  })
}
