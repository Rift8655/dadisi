import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { plansApi } from "@/lib/api"
import { AdminPlanFormSchema } from "@/schemas/plan"

export type CreatePlanPayload = z.infer<typeof AdminPlanFormSchema>
export type UpdatePlanPayload = Partial<CreatePlanPayload>

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
    mutationFn: async ({ id, payload }: { id: number; payload: UpdatePlanPayload }) => {
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
