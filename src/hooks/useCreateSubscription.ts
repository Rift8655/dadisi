import { useMutation } from "@tanstack/react-query"
import { subscriptionsApi } from "@/lib/api"
import { CreateSubscriptionSchema, CreateSubscriptionPayload } from "@/schemas/plan"
import { invalidatePlans } from "@/lib/queryClient"

export function useCreateSubscription() {
  return useMutation({
    mutationFn: async (payload: CreateSubscriptionPayload) => {
      const parsed = CreateSubscriptionSchema.parse(payload)
      const res = await subscriptionsApi.create(parsed)
      return res
    },
    onSuccess: () => {
      try {
        invalidatePlans()
      } catch (e) {}
    },
  })
}

export default useCreateSubscription
