import { create } from "zustand"

interface CreateSubscriptionPayload {
  plan_id: number
  billing_interval: "monthly" | "yearly"
}

interface MembershipState {
  // UI helpers only
  selectedPlanId?: number | null
  setSelectedPlanId?: (id: number | null) => void
}

export const useMembership = create<MembershipState>((set) => ({
  selectedPlanId: null,
  setSelectedPlanId: (id: number | null) => set({ selectedPlanId: id }),
}))

export default useMembership
