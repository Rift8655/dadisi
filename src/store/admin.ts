import { create } from "zustand"
import { adminApi, reconciliationApi } from "@/lib/api-admin"
import { queryClient } from "@/lib/queryClient"
import type { 
  AdminAuditLog, 
  PaginatedResponse, 
  AdminUser, 
  AdminRole, 
  AdminPermission, 
  AdminRetentionSetting, 
  AdminRenewalJob, 
  AdminWebhookEvent, 
  ExchangeRate, 
  UserInvitePayload, 
  BulkUserInvitePayload,
  AdminPost,
} from "@/types/admin"

export interface ReconciliationRun {
  id: number
  status: string
  created_at: string
  total_items: number
  matched_items: number
  unmatched_items: number
}

export interface ReconciliationStats {
  total_runs: number
  total_items: number
  matched_items: number
  unmatched_items: number
  last_run: string | null
}

// Pesapal settings type used by system settings state
export interface PesapalSettings {
  environment: string
  consumer_key: string
  consumer_secret: string
  callback_url: string
  webhook_url: string
}

export interface AdminFilters {
  userSearch: string
  userRoleFilter: string
  userStatusFilter: "all" | "active" | "deleted"
  roleSearch: string
  auditModelFilter: string
  auditActionFilter: string
  auditUserIdFilter: string
  retentionSearch: string
}

export interface AdminPagination {
  usersPage: number
  usersPerPage: number
  rolesPage: number
  rolesPerPage: number
  auditPage: number
  auditPerPage: number
}

export interface AdminEditingContext {
  editingUserId: number | null
  editingRoleId: number | null
  editingRetentionId: number | null
}

interface AdminState {
  filters: AdminFilters
  pagination: AdminPagination
  editingContext: AdminEditingContext
  // Audit logs state
  logs: AdminAuditLog[]
  logsLoading: boolean
  logsTotalPages: number
  loadAuditLogs: () => Promise<void>
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
  setEditingUserId: (id: number | null) => void
  setEditingRoleId: (id: number | null) => void
  setEditingRetentionId: (id: number | null) => void
  resetFilters: () => void
  resetPagination: () => void
  resetEditingContext: () => void
  resetAll: () => void
  
  // Users & Roles
  users: AdminUser[]
  usersLoading: boolean
  usersTotalPages: number
  roles: AdminRole[]
  rolesLoading: boolean
  loadUsers: () => Promise<void>
  loadRoles: () => Promise<void>
  deleteUser: (id: number) => Promise<void>
  restoreUser: (id: number) => Promise<void>
  forceDeleteUser: (id: number) => Promise<void>
  inviteUser: (payload: UserInvitePayload) => Promise<void>
  bulkDeleteUsers: (ids: number[]) => Promise<void>
  bulkRestoreUsers: (ids: number[]) => Promise<void>
  bulkAssignRole: (ids: number[], roleName: string) => Promise<void>
  bulkRemoveRole: (ids: number[], roleName: string) => Promise<void>
  bulkInviteUsers: (payload: BulkUserInvitePayload) => Promise<void>
  loadUser: (id: number) => Promise<AdminUser>
  updateUser: (id: number, data: Partial<AdminUser>) => Promise<void>
  syncUserRoles: (id: number, roleNames: string[]) => Promise<void>
  assignUserRole: (id: number, roleName: string) => Promise<void>
  removeUserRole: (id: number, roleName: string) => Promise<void>
  
  loadRole: (id: number) => Promise<AdminRole>
  loadPermissions: () => Promise<AdminPermission[]>
  updateRole: (id: number, data: Partial<AdminRole>) => Promise<void>
  assignRolePermissions: (id: number, permissionNames: string[]) => Promise<void>
  deleteRole: (id: number) => Promise<void>

  // Admin Menu
  menu: unknown[]
  menuLoading: boolean
  fetchMenu: () => Promise<void>
  // System settings
  systemSettings: PesapalSettings
  systemLoading: boolean
  systemSaving: boolean
  setSystemSettings: (partial: Partial<PesapalSettings>) => void
  fetchSystemSettings: () => Promise<void>
  saveSystemSettings: () => Promise<void>
  // Mock payment testing
  testResults: string[]
  mockPaymentLoading: boolean
  testMockPayment: (payload: { amount: string; description: string; user_email: string }) => Promise<void>

  // Retention settings
  retentionSettings: AdminRetentionSetting[]
  retentionLoading: boolean
  fetchRetentionSettings: () => Promise<void>
  updateRetentionSetting: (id: number, data: { retention_days: number; auto_delete: boolean; description?: string }) => Promise<AdminRetentionSetting>

  // Reconciliation
  reconciliationRuns: ReconciliationRun[]
  reconciliationStats: ReconciliationStats | null
  reconciliationLoading: boolean
  fetchReconciliationRuns: () => Promise<void>
  fetchReconciliationStats: () => Promise<void>
  triggerReconciliation: (mode: "dry_run" | "sync") => Promise<void>
  downloadReconciliationExport: (status?: string) => Promise<string>

  // Renewals
  renewalJobs: AdminRenewalJob[]
  renewalJobsLoading: boolean
  fetchRenewalJobs: () => Promise<void>
  retryRenewalJob: (id: number) => Promise<void>
  cancelRenewalJob: (id: number) => Promise<void>
  extendRenewalGracePeriod: (id: number, days: number, note?: string) => Promise<void>

  // Webhooks
  webhookEvents: AdminWebhookEvent[]
  webhookEventsLoading: boolean
  fetchWebhookEvents: () => Promise<void>

  // Exchange Rates
  exchangeRates: ExchangeRate[]
  exchangeRatesLoading: boolean
  fetchExchangeRates: () => Promise<void>
  updateExchangeRates: (rates: Record<string, number>) => Promise<void>
  
  // Blog
  posts: AdminPost[]
  postsPagination: any | null
  postsLoading: boolean
  fetchPosts: (params?: Record<string, unknown>) => Promise<void>
  deletePost: (id: number | string) => Promise<void>
  restorePost: (id: number | string) => Promise<void>
  forceDeletePost: (id: number | string) => Promise<void>
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
}

const initialPagination: AdminPagination = {
  usersPage: 1,
  usersPerPage: 50,
  rolesPage: 1,
  rolesPerPage: 20,
  auditPage: 1,
  auditPerPage: 50,
}

const initialEditingContext: AdminEditingContext = {
  editingUserId: null,
  editingRoleId: null,
  editingRetentionId: null,
}

export const useAdmin = create<AdminState>((set, get) => ({
  filters: initialFilters,
  pagination: initialPagination,
  editingContext: initialEditingContext,
  logs: [],
  logsLoading: false,
  logsTotalPages: 1,

  setUserSearch: (search: string) =>
    set((state) => ({
      filters: { ...state.filters, userSearch: search },
      pagination: { ...state.pagination, usersPage: 1 },
    })),

  setUserRoleFilter: (role: string) =>
    set((state) => ({
      filters: { ...state.filters, userRoleFilter: role },
      pagination: { ...state.pagination, usersPage: 1 },
    })),

  setUserStatusFilter: (status: "all" | "active" | "deleted") =>
    set((state) => ({
      filters: { ...state.filters, userStatusFilter: status },
      pagination: { ...state.pagination, usersPage: 1 },
    })),

  setRoleSearch: (search: string) =>
    set((state) => ({
      filters: { ...state.filters, roleSearch: search },
      pagination: { ...state.pagination, rolesPage: 1 },
    })),

  setAuditModelFilter: (model: string) =>
    set((state) => ({
      filters: { ...state.filters, auditModelFilter: model },
      pagination: { ...state.pagination, auditPage: 1 },
    })),

  setAuditActionFilter: (action: string) =>
    set((state) => ({
      filters: { ...state.filters, auditActionFilter: action },
      pagination: { ...state.pagination, auditPage: 1 },
    })),

  setAuditUserIdFilter: (userId: string) =>
    set((state) => ({
      filters: { ...state.filters, auditUserIdFilter: userId },
      pagination: { ...state.pagination, auditPage: 1 },
    })),

  setRetentionSearch: (search: string) =>
    set((state) => ({
      filters: { ...state.filters, retentionSearch: search },
    })),

  setUsersPagination: (page: number, perPage?: number) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        usersPage: page,
        usersPerPage: perPage ?? state.pagination.usersPerPage,
      },
    })),

  setRolesPagination: (page: number, perPage?: number) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        rolesPage: page,
        rolesPerPage: perPage ?? state.pagination.rolesPerPage,
      },
    })),

  setAuditPagination: (page: number, perPage?: number) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        auditPage: page,
        auditPerPage: perPage ?? state.pagination.auditPerPage,
      },
    })),

  loadAuditLogs: async () => {
    set({ logsLoading: true })
    try {
      const response = await adminApi.auditLogs.list({
        model: get().filters.auditModelFilter || undefined,
        user_id: get().filters.auditUserIdFilter
          ? parseInt(get().filters.auditUserIdFilter)
          : undefined,
        action: get().filters.auditActionFilter || undefined,
        page: get().pagination.auditPage,
        per_page: get().pagination.auditPerPage,
      })

      const data = Array.isArray(response) ? response : response.data
      const totalPages = Array.isArray(response) ? 1 : (response.last_page || response.meta?.last_page || 1)

      set({
        logs: data,
        logsTotalPages: totalPages,
        logsLoading: false,
      })
    } catch (err) {
      set({ logsLoading: false })
      throw err
    }
  },

  // Users & roles state and actions
  users: [],
  usersLoading: false,
  usersTotalPages: 1,
  roles: [],
  rolesLoading: false,
  loadUsers: async () => {
    set({ usersLoading: true })
    try {
      const params: Record<string, unknown> = {
        search: get().filters.userSearch,
        status: get().filters.userStatusFilter,
        page: get().pagination.usersPage,
        per_page: get().pagination.usersPerPage,
      }
      if (get().filters.userRoleFilter) params.role = get().filters.userRoleFilter
      const response = await adminApi.users.list(params)
      
      const data = Array.isArray(response) ? response : response.data
      const totalPages = Array.isArray(response) ? 1 : (response.last_page || response.meta?.last_page || 1)

      set({ users: data, usersTotalPages: totalPages, usersLoading: false })
    } catch (err) {
      set({ usersLoading: false })
      throw err
    }
  },
  loadRoles: async () => {
    set({ rolesLoading: true })
    try {
      const response = await adminApi.roles.list({ search: "", per_page: 100, include_permissions: true })
      const data = Array.isArray(response) ? response : response.data
      set({ roles: data, rolesLoading: false })
    } catch (err) {
      set({ rolesLoading: false })
      throw err
    }
  },
  deleteUser: async (id: number) => {
    await adminApi.users.delete(id)
    await get().loadUsers()
    try {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    } catch (e) {}
  },
  restoreUser: async (id: number) => {
    await adminApi.users.restore(id)
    await get().loadUsers()
    try {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    } catch (e) {}
  },
  forceDeleteUser: async (id: number) => {
    await adminApi.users.forceDelete(id)
    await get().loadUsers()
    try {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    } catch (e) {}
  },
  inviteUser: async (payload: UserInvitePayload) => {
    await adminApi.users.invite(payload)
    await get().loadUsers()
    try {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    } catch (e) {}
  },
  bulkDeleteUsers: async (ids: number[]) => {
    await adminApi.users.bulkDelete(ids)
    await get().loadUsers()
    try {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    } catch (e) {}
  },
  bulkRestoreUsers: async (ids: number[]) => {
    await adminApi.users.bulkRestore(ids)
    await get().loadUsers()
    try {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    } catch (e) {}
  },
  bulkAssignRole: async (ids: number[], roleName: string) => {
    await adminApi.users.bulkAssignRole(ids, roleName)
    await get().loadUsers()
    try {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    } catch (e) {}
  },
  bulkRemoveRole: async (ids: number[], roleName: string) => {
    await adminApi.users.bulkRemoveRole(ids, roleName)
    await get().loadUsers()
    try {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    } catch (e) {}
  },
  bulkInviteUsers: async (payload: BulkUserInvitePayload) => {
    await adminApi.users.bulkInvite(payload)
    await get().loadUsers()
    try {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    } catch (e) {}
  },
  // User detail operations that return data for pages to consume
  loadUser: async (id: number) => {
    const user = await adminApi.users.get(id)
    return user
  },
  updateUser: async (id: number, data: Partial<AdminUser>) => {
    await adminApi.users.update(id, data)
  },
  syncUserRoles: async (id: number, roleNames: string[]) => {
    await adminApi.users.syncRoles(id, roleNames)
  },
  assignUserRole: async (id: number, roleName: string) => {
    await adminApi.users.assignRole(id, roleName)
  },
  removeUserRole: async (id: number, roleName: string) => {
    await adminApi.users.removeRole(id, roleName)
  },

  // Roles detail operations
  loadRole: async (id: number) => {
    const role = await adminApi.roles.get(id)
    return role
  },
  loadPermissions: async () => {
    const response = await adminApi.permissions.list({ per_page: 200 })
    return Array.isArray(response) ? response : response.data
  },
  updateRole: async (id: number, data: Partial<AdminRole>) => {
    await adminApi.roles.update(id, data)
  },
  assignRolePermissions: async (id: number, permissionNames: string[]) => {
    await adminApi.roles.assignPermissions(id, permissionNames)
  },
  deleteRole: async (id: number) => {
    await adminApi.roles.delete(id)
  },

  setEditingUserId: (id: number | null) =>
    set((state) => ({
      editingContext: { ...state.editingContext, editingUserId: id },
    })),

  setEditingRoleId: (id: number | null) =>
    set((state) => ({
      editingContext: { ...state.editingContext, editingRoleId: id },
    })),

  setEditingRetentionId: (id: number | null) =>
    set((state) => ({
      editingContext: { ...state.editingContext, editingRetentionId: id },
    })),

  resetFilters: () => set({ filters: initialFilters }),
  resetPagination: () => set({ pagination: initialPagination }),
  resetEditingContext: () => set({ editingContext: initialEditingContext }),
  resetAll: () =>
    set({
      filters: initialFilters,
      pagination: initialPagination,
      editingContext: initialEditingContext,
    }),

  // System settings defaults
  systemSettings: {
    environment: 'sandbox',
    consumer_key: '',
    consumer_secret: '',
    callback_url: 'http://localhost:3000/payment/callback',
    webhook_url: 'https://your-domain.com/api/webhooks/pesapal',
  },
  systemLoading: false,
  systemSaving: false,
  setSystemSettings: (partial: Partial<PesapalSettings>) =>
    set((state) => ({ systemSettings: { ...state.systemSettings, ...partial } })),
  fetchSystemSettings: async () => {
    set({ systemLoading: true })
    try {
      const data = await adminApi.systemSettings.list({ group: 'pesapal' }) || {}
      
      // Map "pesapal.key" -> "key"
      const settings: PesapalSettings = {
        environment: (data['pesapal.environment'] as string) || 'sandbox',
        consumer_key: (data['pesapal.consumer_key'] as string) || '',
        consumer_secret: (data['pesapal.consumer_secret'] as string) || '',
        callback_url: (data['pesapal.callback_url'] as string) || 'http://localhost:3000/payment/callback',
        webhook_url: (data['pesapal.webhook_url'] as string) || 'https://your-domain.com/api/webhooks/pesapal',
      }

      set({
        systemSettings: settings,
        systemLoading: false,
      })
    } catch (err) {
      set({ systemLoading: false })
      throw err
    }
  },
  saveSystemSettings: async () => {
    set({ systemSaving: true })
    try {
      const current = get().systemSettings
      // Map "key" -> "pesapal.key"
      const payload = {
        'pesapal.environment': current.environment,
        'pesapal.consumer_key': current.consumer_key,
        'pesapal.consumer_secret': current.consumer_secret,
        'pesapal.callback_url': current.callback_url,
        'pesapal.webhook_url': current.webhook_url,
      }

      await adminApi.systemSettings.update(payload)
      set({ systemSaving: false })
    } catch (err) {
      set({ systemSaving: false })
      throw err
    }
  },

  testResults: [],
  mockPaymentLoading: false,
  testMockPayment: async (payload: { amount: string; description: string; user_email: string }) => {
    set({ mockPaymentLoading: true, testResults: [] })
    try {
      set((state) => ({ testResults: [...state.testResults, `🧪 Starting mock payment test...`] }))
      set((state) => ({ testResults: [...state.testResults, `📝 Creating test payment record...`] }))

      const trackingId = 'MOCK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase()

      set((state) => ({ testResults: [...state.testResults, `✅ Mock payment record created with tracking ID: ${trackingId}`] }))

      const mockUrl = `http://localhost:8000/mock-payment/${trackingId}`
      set((state) => ({ testResults: [...state.testResults, `🔗 Mock payment URL: ${mockUrl}`] }))
      set((state) => ({ testResults: [...state.testResults, `💡 Click to visit and complete the mock payment`] }))

      set((state) => ({ testResults: [...state.testResults, ``, `🔗 Direct link: `, `${mockUrl}`] }))

      set((state) => ({ testResults: [...state.testResults, ``, `🪝 For webhook testing after completing payment:`] }))
      set((state) => ({ testResults: [...state.testResults, `curl -X POST http://localhost:8000/api/webhooks/pesapal \\`] }))
      set((state) => ({ testResults: [...state.testResults, `  -H "Content-Type: application/json" \\`] }))
      set((state) => ({ testResults: [...state.testResults, `  -d '{"OrderTrackingId": "${trackingId}", "OrderNotificationType": "PAYMENT_COMPLETED"}'`] }))

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      set((state) => ({ testResults: [...state.testResults, `❌ Test failed: ${errorMessage}`] }))
      throw err
    } finally {
      set({ mockPaymentLoading: false })
    }
  },

  // Retention settings state & actions
  retentionSettings: [],
  retentionLoading: false,
  fetchRetentionSettings: async () => {
    set({ retentionLoading: true })
    try {
      const data = await adminApi.retention.list() as any
      // Handle potential ApiResponse wrapper if structure is complex or unknown
      const list = Array.isArray(data) ? data : data?.data || []
      set({ retentionSettings: list as AdminRetentionSetting[], retentionLoading: false })
    } catch (err) {
      set({ retentionLoading: false })
      throw err
    }
  },
  updateRetentionSetting: async (id: number, data: { retention_days: number; auto_delete: boolean; description?: string }) => {
    const response = await adminApi.retention.update(id, data) as any
    // The API returns nested data format: { data: { ... } }
    const updated = (response.data || response) as AdminRetentionSetting
    set((state) => ({ retentionSettings: state.retentionSettings.map((s) => (s.id === id ? updated : s)) }))
    try {
      queryClient.invalidateQueries({ queryKey: ["retentionSettings"] })
    } catch (e) {}
    return updated
  },

  // Admin menu
  menu: [],
  menuLoading: false,
  fetchMenu: async () => {
    set({ menuLoading: true })
    try {
      const response = await adminApi.getMenu()
      set({ menu: response || [], menuLoading: false })
    } catch (err) {
      set({ menuLoading: false })
      throw err
    }
  },

  // Reconciliation actions
  reconciliationRuns: [],
  reconciliationStats: null,
  reconciliationLoading: false,
  fetchReconciliationRuns: async () => {
    set({ reconciliationLoading: true })
    try {
      const data = await reconciliationApi.list() as any
      set({ 
        reconciliationRuns: Array.isArray(data) ? data : (data?.data || []),
        reconciliationLoading: false 
      })
    } catch (err) {
      set({ reconciliationLoading: false })
      throw err
    }
  },
  fetchReconciliationStats: async () => {
    try {
      const data = await reconciliationApi.stats()
      set({ reconciliationStats: data as ReconciliationStats })
    } catch (err) {
      console.error("Failed to fetch reconciliation stats", err)
    }
  },
  triggerReconciliation: async (mode) => {
    await reconciliationApi.trigger({ mode })
    await get().fetchReconciliationRuns()
    await get().fetchReconciliationStats()
  },
  downloadReconciliationExport: async (status?: string) => {
    const response = await reconciliationApi.export({ status })
    return response as unknown as string
  },

  // Renewals implementation
  renewalJobs: [],
  renewalJobsLoading: false,
  fetchRenewalJobs: async () => {
    set({ renewalJobsLoading: true })
    try {
      const response = await adminApi.renewals.list()
      const data = Array.isArray(response) ? response : response.data
      set({ 
        renewalJobs: data,
        renewalJobsLoading: false 
      })
    } catch (err) {
      set({ renewalJobsLoading: false })
      throw err
    }
  },
  retryRenewalJob: async (id: number) => {
    await adminApi.renewals.retry(id)
    await get().fetchRenewalJobs()
  },
  cancelRenewalJob: async (id: number) => {
    await adminApi.renewals.cancel(id)
    await get().fetchRenewalJobs()
  },
  extendRenewalGracePeriod: async (id: number, days: number, note?: string) => {
    await adminApi.renewals.extendGracePeriod(id, { days, note })
    await get().fetchRenewalJobs()
  },

  // Webhooks implementation
  webhookEvents: [],
  webhookEventsLoading: false,
  fetchWebhookEvents: async () => {
    set({ webhookEventsLoading: true })
    try {
      const response = await adminApi.webhooks.list()
      const data = Array.isArray(response) ? response : (response.data || [])
      set({ 
        webhookEvents: data,
        webhookEventsLoading: false 
      })
    } catch (err) {
      set({ webhookEventsLoading: false })
      throw err
    }
  },

  // Exchange Rates implementation
  exchangeRates: [],
  exchangeRatesLoading: false,
  fetchExchangeRates: async () => {
    set({ exchangeRatesLoading: true })
    try {
      const data = await adminApi.exchangeRates.list() as any
      set({ 
        exchangeRates: Array.isArray(data) ? data : (data?.data || []),
        exchangeRatesLoading: false 
      })
    } catch (err) {
      set({ exchangeRatesLoading: false })
      throw err
    }
  },
  updateExchangeRates: async (rates: Record<string, number>) => {
    await adminApi.exchangeRates.update({ rates })
    await get().fetchExchangeRates()
  },

  // Blog Management State
  posts: [],
  postsPagination: null,
  postsLoading: false,
  fetchPosts: async (params?: Record<string, unknown>) => {
    set({ postsLoading: true })
    try {
      const data = await adminApi.blog.posts.list(params) as any
      // Handle pagination structure
      set({ 
        posts: Array.isArray(data) ? (data as AdminPost[]) : (data?.data || []) as AdminPost[],
        postsPagination: data?.pagination || data?.meta || null,
        postsLoading: false
      })
    } catch (err) {
      set({ postsLoading: false })
      throw err
    }
  },
  deletePost: async (id: number | string) => {
    await adminApi.blog.posts.delete(id)
    await get().fetchPosts()
  },
  restorePost: async (id: number | string) => {
    await adminApi.blog.posts.restore(id)
    await get().fetchPosts()
  },
  forceDeletePost: async (id: number | string) => {
    await adminApi.blog.posts.forceDelete(id)
    await get().fetchPosts()
  },

}))
