import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SidebarState {
  isOpen: boolean // mobile overlay
  isCollapsed: boolean // desktop/tablet
  setIsOpen: (open: boolean) => void
  setIsCollapsed: (collapsed: boolean) => void
  toggleOpen: () => void
  toggleCollapsed: () => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: false,
      isCollapsed: false,
      setIsOpen: (open) => set({ isOpen: open }),
      setIsCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    }),
    {
      name: "sidebar-storage",
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
      }),
    }
  )
)
