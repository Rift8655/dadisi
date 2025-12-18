import { create } from "zustand"
import { persist } from "zustand/middleware"

interface DonationState {
  lastDonation?: {
    amount: number
    currency: string
    name?: string
  }
  setLastDonation: (data: { amount: number; currency: string; name?: string }) => void
  clearLastDonation: () => void
}

export const useDonationStore = create<DonationState>()(
  persist(
    (set) => ({
      lastDonation: undefined,
      setLastDonation: (data) => set({ lastDonation: data }),
      clearLastDonation: () => set({ lastDonation: undefined }),
    }),
    {
      name: "donation-storage",
    }
  )
)
