import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api-admin"

export function useAdminSystemSettings(group: string = "pesapal") {
  return useQuery({
    queryKey: ["admin-system-settings", group],
    queryFn: async () => {
      return await adminApi.systemSettings.list({ group })
    },
    staleTime: Infinity, // Tier 1: Static config - only changes via admin mutation
  })
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (settings: Record<string, any>) => {
      return await adminApi.systemSettings.update(settings)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-system-settings"] })
    },
  })
}
