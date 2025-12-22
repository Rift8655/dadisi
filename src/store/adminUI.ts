import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface AdminFilters {
  userSearch: string
  userRoleFilter: string
  userStatusFilter: "all" | "active" | "deleted"
  roleSearch: string
  auditModelFilter: string
  auditActionFilter: string
  auditUserIdFilter: string
  retentionSearch: string
  blogStatusFilter: "all" | "published" | "draft" | "trashed"
  blogSearch: string
}

export interface AdminPagination {
  usersPage: number
  usersPerPage: number
  rolesPage: number
  rolesPerPage: number
  auditPage: number
  auditPerPage: number
  blogPage: number
  blogPerPage: number
}

interface AdminUIState {
  filters: AdminFilters
  pagination: AdminPagination
  editingContext: {
    editingUserId: number | null
    editingRoleId: number | null
    editingRetentionId: number | null
  }
  
  // Actions
  setUserSearch: (search: string) => void
  setUserRoleFilter: (role: string) => void
  setUserStatusFilter: (status: "all" | "active" | "deleted") => void
  setRoleSearch: (search: string) => void
  setAuditModelFilter: (model: string) => void
  setAuditActionFilter: (action: string) => void
  setAuditUserIdFilter: (userId: string) => void
  setRetentionSearch: (search: string) => void
  
  setUsersPagination: (page: number, perPage?: number) => void
  setRolesPagination: (page: number, perPage?: number) => void
  setAuditPagination: (page: number, perPage?: number) => void
  setBlogStatusFilter: (status: "all" | "published" | "draft" | "trashed") => void
  setBlogSearch: (search: string) => void
  setBlogPagination: (page: number, perPage?: number) => void

  
  setEditingUserId: (id: number | null) => void
  setEditingRoleId: (id: number | null) => void
  setEditingRetentionId: (id: number | null) => void
  
  resetFilters: () => void
  resetPagination: () => void
  resetAll: () => void
}

const initialFilters: AdminFilters = {
  userSearch: "",
  userRoleFilter: "",
  userStatusFilter: "active",
  roleSearch: "",
  auditModelFilter: "",
  auditActionFilter: "",
  auditUserIdFilter: "",
  retentionSearch: "",
  blogStatusFilter: "all",
  blogSearch: "",
}

const initialPagination: AdminPagination = {
  usersPage: 1,
  usersPerPage: 50,
  rolesPage: 1,
  rolesPerPage: 20,
  auditPage: 1,
  auditPerPage: 50,
  blogPage: 1,
  blogPerPage: 10,
}

export const useAdminUI = create<AdminUIState>()(
  persist(
    (set) => ({
      filters: initialFilters,
      pagination: initialPagination,
      editingContext: {
        editingUserId: null,
        editingRoleId: null,
        editingRetentionId: null,
      },

      setUserSearch: (search) =>
        set((state) => ({
          filters: { ...state.filters, userSearch: search },
          pagination: { ...state.pagination, usersPage: 1 },
        })),

      setUserRoleFilter: (role) =>
        set((state) => ({
          filters: { ...state.filters, userRoleFilter: role },
          pagination: { ...state.pagination, usersPage: 1 },
        })),

      setUserStatusFilter: (status) =>
        set((state) => ({
          filters: { ...state.filters, userStatusFilter: status },
          pagination: { ...state.pagination, usersPage: 1 },
        })),

      setRoleSearch: (search) =>
        set((state) => ({
          filters: { ...state.filters, roleSearch: search },
          pagination: { ...state.pagination, rolesPage: 1 },
        })),

      setAuditModelFilter: (model) =>
        set((state) => ({
          filters: { ...state.filters, auditModelFilter: model },
          pagination: { ...state.pagination, auditPage: 1 },
        })),

      setAuditActionFilter: (action) =>
        set((state) => ({
          filters: { ...state.filters, auditActionFilter: action },
          pagination: { ...state.pagination, auditPage: 1 },
        })),

      setAuditUserIdFilter: (userId) =>
        set((state) => ({
          filters: { ...state.filters, auditUserIdFilter: userId },
          pagination: { ...state.pagination, auditPage: 1 },
        })),

      setRetentionSearch: (search) =>
        set((state) => ({
          filters: { ...state.filters, retentionSearch: search },
        })),

      setUsersPagination: (page, perPage) =>
        set((state) => ({
          pagination: {
            ...state.pagination,
            usersPage: page,
            usersPerPage: perPage ?? state.pagination.usersPerPage,
          },
        })),

      setRolesPagination: (page, perPage) =>
        set((state) => ({
          pagination: {
            ...state.pagination,
            rolesPage: page,
            rolesPerPage: perPage ?? state.pagination.rolesPerPage,
          },
        })),

      setAuditPagination: (page, perPage) =>
        set((state) => ({
          pagination: {
            ...state.pagination,
            auditPage: page,
            auditPerPage: perPage ?? state.pagination.auditPerPage,
          },
        })),

      setBlogStatusFilter: (status) =>
        set((state) => ({
          filters: { ...state.filters, blogStatusFilter: status },
          pagination: { ...state.pagination, blogPage: 1 },
        })),

      setBlogSearch: (search) =>
        set((state) => ({
          filters: { ...state.filters, blogSearch: search },
          pagination: { ...state.pagination, blogPage: 1 },
        })),

      setBlogPagination: (page, perPage) =>
        set((state) => ({
          pagination: {
            ...state.pagination,
            blogPage: page,
            blogPerPage: perPage ?? state.pagination.blogPerPage,
          },
        })),


      setEditingUserId: (id) =>
        set((state) => ({
          editingContext: { ...state.editingContext, editingUserId: id },
        })),

      setEditingRoleId: (id) =>
        set((state) => ({
          editingContext: { ...state.editingContext, editingRoleId: id },
        })),

      setEditingRetentionId: (id) =>
        set((state) => ({
          editingContext: { ...state.editingContext, editingRetentionId: id },
        })),

      resetFilters: () => set({ filters: initialFilters }),
      resetPagination: () => set({ pagination: initialPagination }),
      resetAll: () =>
        set({
          filters: initialFilters,
          pagination: initialPagination,
        }),
    }),
    {
      name: "admin-ui-storage",
    }
  )
)
