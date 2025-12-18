import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { plansApi } from "@/lib/api"
import { invalidatePlans } from "@/lib/queryClient"
import { AdminPlanFormSchema } from "@/schemas/plan"

export type CreatePlanPayload = z.infer<typeof AdminPlanFormSchema>
export type UpdatePlanPayload = Partial<CreatePlanPayload>

export function useCreatePlan() {
  return useMutation({
    mutationFn: async (payload: CreatePlanPayload) => {
      // Allow partial validation or full
      const validated = AdminPlanFormSchema.parse(payload)
      const res = await plansApi.create(validated)
      invalidatePlans()
      return res
    },
  })
}

export function useUpdatePlan() {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdatePlanPayload }) => {
      const res = await plansApi.update(id, payload)
      invalidatePlans()
      return res
    },
  })
}

export function useDeletePlan() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await plansApi.remove(id)
      invalidatePlans()
      return res
    },
  })
}

