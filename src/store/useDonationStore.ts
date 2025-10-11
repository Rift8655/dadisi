"use client"
import { create } from "zustand"

type Donation = { amount: number; name?: string; message?: string }

type DonationState = {
  last?: Donation
  donate: (d: Donation) => void
}

export const useDonationStore = create<DonationState>((set) => ({
  last: undefined,
  donate: (d) => set({ last: d }),
}))
