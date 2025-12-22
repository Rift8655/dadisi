"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type BlogViewType = "grid" | "list" | "masonry"

interface BlogUIState {
  // View preferences (persisted)
  viewType: BlogViewType
  perPage: number
  
  // Transient filter state (not persisted)
  searchQuery: string
  selectedCategoryId: number | null
  selectedTagIds: number[]
  currentPage: number

  // Actions
  setViewType: (viewType: BlogViewType) => void
  setPerPage: (perPage: number) => void
  setSearchQuery: (query: string) => void
  setSelectedCategoryId: (id: number | null) => void
  toggleTagId: (id: number) => void
  clearTagIds: () => void
  setCurrentPage: (page: number) => void
  resetFilters: () => void
}

export const useBlogStore = create<BlogUIState>()(
  persist(
    (set) => ({
      // Persisted defaults
      viewType: "grid",
      perPage: 12,

      // Transient defaults
      searchQuery: "",
      selectedCategoryId: null,
      selectedTagIds: [],
      currentPage: 1,

      setViewType: (viewType) => set({ viewType }),
      setPerPage: (perPage) => set({ perPage, currentPage: 1 }),
      setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
      setSelectedCategoryId: (selectedCategoryId) =>
        set({ selectedCategoryId, currentPage: 1 }),
      toggleTagId: (id) =>
        set((state) => ({
          selectedTagIds: state.selectedTagIds.includes(id)
            ? state.selectedTagIds.filter((tid) => tid !== id)
            : [...state.selectedTagIds, id],
          currentPage: 1,
        })),
      clearTagIds: () => set({ selectedTagIds: [], currentPage: 1 }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      resetFilters: () =>
        set({
          searchQuery: "",
          selectedCategoryId: null,
          selectedTagIds: [],
          currentPage: 1,
        }),
    }),
    {
      name: "blog-ui-storage",
      // Only persist view preferences, not transient filter state
      partialize: (state) => ({
        viewType: state.viewType,
        perPage: state.perPage,
      }),
    }
  )
)
