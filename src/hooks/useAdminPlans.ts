import { AdminPlanFormSchema } from "@/schemas/plan"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

import { plansApi } from "@/lib/api"

export type CreatePlanPayload = z.infer<typeof AdminPlanFormSchema>
export type UpdatePlanPayload = Partial<CreatePlanPayload>

/**
 * Hook to fetch a single plan by ID including system_features
 */
export function usePlan(id: number) {
  return useQuery({
    queryKey: ["plans", id],
    queryFn: async () => {
      const response = await plansApi.get(id)
      return response.data || response
    },
    enabled: !!id && id > 0,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreatePlanPayload) => {
      // Allow partial validation or full
      const validated = AdminPlanFormSchema.parse(payload)
      return await plansApi.create(validated)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] })
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number
      payload: UpdatePlanPayload
    }) => {
      return await plansApi.update(id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] })
    },
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      return await plansApi.remove(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] })
    },
  })
}
