"use client"
import { create } from "zustand"

type RSVPState = {
  rsvps: Record<number, boolean>
  toggle: (id: number) => void
}

export const useRsvpStore = create<RSVPState>((set) => ({
  rsvps: {},
  toggle: (id) =>
    set((s) => ({ rsvps: { ...s.rsvps, [id]: !s.rsvps[id] } })),
}))
