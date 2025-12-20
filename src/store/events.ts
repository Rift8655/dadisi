import { create } from "zustand"
import type { Event } from "@/types"

interface EventsState {
  // Client UI state only
  filters: {
    category: string | null
    tag: string | null
    search: string
  }
  setFilters: (filters: Partial<EventsState["filters"]>) => void
  resetFilters: () => void
}

export const useEvents = create<EventsState>((set) => ({
  filters: {
    category: null,
    tag: null,
    search: "",
  },
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () =>
    set({
      filters: {
        category: null,
        tag: null,
        search: "",
      },
    }),
}))
