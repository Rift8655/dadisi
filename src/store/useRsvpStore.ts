"use client"
import { create } from "zustand"

export type RSVPDetails = {
  name: string
  email: string
  guests: number
  note?: string
}

type RSVPState = {
  rsvps: Record<number, RSVPDetails | undefined>
  set: (id: number, details: RSVPDetails) => void
  cancel: (id: number) => void
}

export const useRsvpStore = create<RSVPState>((set) => ({
  rsvps: {},
  set: (id, details) => set((s) => ({ rsvps: { ...s.rsvps, [id]: details } })),
  cancel: (id) => set((s) => {
    const next = { ...s.rsvps }
    delete next[id]
    return { rsvps: next }
  }),
}))
