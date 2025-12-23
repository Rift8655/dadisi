"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { systemFeaturesApi } from "@/lib/api-admin"
import type { SystemFeature } from "@/schemas/plan"

/**
 * Hook to fetch all system features
 * @param active - If true, only fetch active features (default: true)
 */
export function useSystemFeatures(active: boolean = true) {
  return useQuery({
    queryKey: ["system-features", { active }],
    queryFn: async () => {
      const response = await systemFeaturesApi.list({ active })
      return response.data as SystemFeature[]
    },
  })
}

/**
 * Hook to fetch a single system feature by ID
 */
export function useSystemFeature(id: number) {
  return useQuery({
    queryKey: ["system-features", id],
    queryFn: async () => {
      const response = await systemFeaturesApi.get(id)
      return response.data as SystemFeature
    },
    enabled: !!id,
  })
}

/**
 * Hook to update a system feature
 */
export function useUpdateSystemFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; description?: string; default_value?: string; is_active?: boolean; sort_order?: number } }) =>
      systemFeaturesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-features"] })
    },
  })
}

/**
 * Hook to toggle a system feature's active status
 */
export function useToggleSystemFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => systemFeaturesApi.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-features"] })
    },
  })
}
