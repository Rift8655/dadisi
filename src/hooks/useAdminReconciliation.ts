import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { reconciliationApi } from "@/lib/api-admin"
import type { ReconciliationRun, ReconciliationStats } from "@/types/admin"

export function useAdminReconciliationRuns() {
  return useQuery<ReconciliationRun[]>({
    queryKey: ["admin-reconciliation-runs"],
    queryFn: async () => {
      const data = await reconciliationApi.list()
      return Array.isArray(data) ? data : (data as any)?.data || []
    },
    staleTime: 60 * 1000, // Tier 4: Dynamic - payment sync status
  })
}

export function useAdminReconciliationStats() {
  return useQuery<ReconciliationStats>({
    queryKey: ["admin-reconciliation-stats"],
    queryFn: async () => {
      const data = await reconciliationApi.stats()
      return (data as any)?.data || data
    },
    staleTime: 60 * 1000, // Tier 4: Dynamic - aggregated stats
  })
}

export function useTriggerReconciliation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { mode: "dry_run" | "sync" }) => {
      return await reconciliationApi.trigger(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reconciliation-runs"] })
      queryClient.invalidateQueries({ queryKey: ["admin-reconciliation-stats"] })
    },
  })
}

export function useExportReconciliation() {
  return useMutation<string, Error, { status?: string } | undefined>({
    mutationFn: async (params) => {
      const data = await reconciliationApi.export(params)
      return data as string
    },
  })
}
