import { create } from "zustand"

import { plansApi, subscriptionsApi } from "@/lib/api"
import { CreateSubscriptionSchema } from "@/schemas/plan"

interface CreateSubscriptionPayload {
  plan_id: number
  billing_interval: "monthly" | "yearly"
}

interface MembershipState {
  // membership store no longer stores server-sourced `plans`.
  // React Query owns plans caching. Keep only client-side actions.
  createSubscription: (payload: CreateSubscriptionPayload) => Promise<any>
  // optional UI helpers
  selectedPlanId?: number | null
  setSelectedPlanId?: (id: number | null) => void
}

export const useMembership = create<MembershipState>((set) => ({
  createSubscription: async (payload: CreateSubscriptionPayload) => {
    // validate payload with Zod before sending to API
    const parsed = CreateSubscriptionSchema.parse(payload)
    try {
      const data = await subscriptionsApi.create(parsed)
      return data
    } catch (err: unknown) {
      throw err
    }
  },
  selectedPlanId: null,
  setSelectedPlanId: (id: number | null) => set({ selectedPlanId: id }),
}))

export default useMembership
