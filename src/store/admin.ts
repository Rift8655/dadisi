import { create } from "zustand"

/**
 * @deprecated useAdmin is deprecated. 
 * - For UI state (filters, pagination), use useAdminUI from @/store/adminUI
 * - For data operations, use TanStack Query hooks from @/hooks/useAdmin* or @/hooks/useUsers, @/hooks/useRoles
 */
export const useAdmin = create<any>(() => ({
  // This store is deprecated and all its functionality has been migrated to hooks and useAdminUI.
  // It is kept temporarily to avoid breaking legacy code and tests.
}))

