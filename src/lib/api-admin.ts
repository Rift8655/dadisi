import { api, ApiResponse, apiRequestWithSchema } from "@/lib/api"
import type { RetentionSetting } from "@/types/index"
import { z } from "zod"
import { AdminMenuItemSchema } from "@/contracts/auth.contract"
import {
  AdminUserSchema,
  AdminRoleSchema,
  AdminRetentionSettingSchema,
  AdminAuditLogSchema,
  AdminRenewalJobSchema,
  PaginatedSchema,
  AdminPermissionSchema,
  AdminPostSchema,
  AdminCategorySchema,
  AdminTagSchema,
  AdminWebhookEventSchema,
  AdminPlanSchema,
} from "@/schemas/admin"
import type { 
  AdminUser, 
  AdminRole, 
  AdminAuditLog, 
  AdminRenewalJob, 
  UserInvitePayload, 
  BulkUserInvitePayload, 
  AdminPermission,
  AdminPost,
  AdminPlan,
} from "@/types/admin"

// User Management API
// User Management API
export const userApi = {
  list: async (params?: Record<string, unknown>): Promise<any> => {
    const res = await api.get<ApiResponse<unknown>>("/api/admin/users", { params: params as Record<string, string | number | boolean> })
    
    // Validate either paginated or array response
    return PaginatedSchema(AdminUserSchema)
      .or(z.array(AdminUserSchema))
      .parse(res.data)
  },
  get: async (id: number): Promise<AdminUser> => {
    const res = await api.get<ApiResponse<unknown>>(`/api/admin/users/${id}`)
    return AdminUserSchema.parse(res.data)
  },
  update: (id: number, data: unknown) => api.put<unknown>(`/api/admin/users/${id}`, data),
  delete: (id: number) => api.delete<unknown>(`/api/admin/users/${id}`),
  restore: (id: number) => api.post<unknown>(`/api/admin/users/${id}/restore`),
  forceDelete: (id: number) => api.delete<unknown>(`/api/admin/users/${id}/force`),
  invite: (data: UserInvitePayload | unknown) => api.post<unknown>("/api/admin/users/invite", data),
  bulkDelete: (ids: number[]) => api.post<unknown>("/api/admin/users/bulk/delete", { ids }),
  bulkRestore: (ids: number[]) => api.post<unknown>("/api/admin/users/bulk/restore", { ids }),
  bulkAssignRole: (ids: number[], role: string) => api.post<unknown>("/api/admin/users/bulk/assign-role", { user_ids: ids, role }),
  bulkRemoveRole: (ids: number[], role: string) => api.post<unknown>("/api/admin/users/bulk/remove-role", { user_ids: ids, role }),
  bulkInvite: (data: BulkUserInvitePayload | { users: unknown[] }) => api.post<unknown>("/api/admin/users/bulk-invite", data),
  syncRoles: (id: number, roles: string[]) => api.post<unknown>(`/api/admin/users/${id}/roles`, { roles }),
  assignRole: (id: number, role: string) => api.post<unknown>(`/api/admin/users/${id}/roles`, { role }),
  removeRole: (id: number, role: string) => api.delete<unknown>(`/api/admin/users/${id}/roles/${role}`),
}

// Role Management API
// Role Management API
export const roleApi = {
  list: async (params?: Record<string, unknown>): Promise<any> => {
    const res = await api.get<ApiResponse<unknown>>("/api/admin/roles", { params: params as Record<string, string | number | boolean> })
    
    return PaginatedSchema(AdminRoleSchema)
      .or(z.array(AdminRoleSchema))
      .parse(res.data)
  },
  get: async (id: number): Promise<AdminRole> => {
    const res = await api.get<ApiResponse<unknown>>(`/api/admin/roles/${id}`)
    return AdminRoleSchema.parse(res.data)
  },
  update: async (id: number, data: unknown): Promise<AdminRole> => {
    const res = await api.put<ApiResponse<unknown>>(`/api/admin/roles/${id}`, data)
    return AdminRoleSchema.parse(res.data)
  },
  create: async (data: unknown): Promise<AdminRole> => {
    const res = await api.post<ApiResponse<unknown>>("/api/admin/roles", data)
    return AdminRoleSchema.parse(res.data)
  },
  delete: (id: number) => api.delete<unknown>(`/api/admin/roles/${id}`),
  assignPermissions: (id: number, permissions: string[]) => api.post<unknown>(`/api/admin/roles/${id}/permissions`, { permissions }),
}

// Permission Management API
// Permission Management API
export const permissionApi = {
  list: async (params?: Record<string, unknown>): Promise<any> => {
    const res = await api.get<ApiResponse<unknown>>("/api/admin/permissions", { params: params as Record<string, string | number | boolean> })
    
    return PaginatedSchema(AdminPermissionSchema)
      .or(z.array(AdminPermissionSchema))
      .parse(res.data)
  },
  create: async (data: unknown): Promise<AdminPermission> => {
    const res = await api.post<ApiResponse<unknown>>("/api/admin/permissions", data)
    return AdminPermissionSchema.parse(res.data)
  },
}

// Audit Logs API
// Audit Logs API
export const auditLogApi = {
  list: async (params?: Record<string, unknown>): Promise<any> => {
    const res = await api.get<ApiResponse<unknown>>("/api/admin/audit-logs", { params: params as Record<string, string | number | boolean> })
    
    return PaginatedSchema(AdminAuditLogSchema)
      .or(z.array(AdminAuditLogSchema))
      .parse(res.data)
  },
}

// Retention Settings API (Admin only)
export const retentionApi = {
  list: (params?: { data_type?: string }) => api.get<unknown>("/api/admin/retention-settings", { params }),

  getOne: (id: number) => api.get<unknown>(`/api/admin/retention-settings/${id}`),

  update: (
    id: number,
    data: { retention_days: number; auto_delete: boolean; description?: string }
  ) => api.put<unknown>(`/api/admin/retention-settings/${id}`, data),

  getSummary: () => api.get<unknown>("/api/admin/retention-settings-summary"),
}

// Reconciliation API
// Reconciliation API
export const reconciliationApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<unknown>("/api/admin/reconciliation", { params }),
  get: (id: number) => api.get<unknown>(`/api/admin/reconciliation/${id}`),
  stats: () => api.get<unknown>("/api/admin/reconciliation/stats"),
  trigger: (data: { mode: "dry_run" | "sync" }) => 
    api.post<unknown>("/api/admin/reconciliation/trigger", data),
  export: (params?: { status?: string }) => 
    api.get<unknown>("/api/admin/reconciliation/export", { params, headers: { Accept: "text/csv" } }),
}

// Admin - Auto Renewal Jobs
// Admin - Auto Renewal Jobs
export const renewalsApi = {
  list: async (params?: Record<string, unknown>): Promise<any> => {
    const res = await api.get<ApiResponse<unknown>>("/api/admin/auto-renewal-jobs", { params: params as Record<string, string | number | boolean> })
    
    return PaginatedSchema(AdminRenewalJobSchema)
      .or(z.array(AdminRenewalJobSchema))
      .parse(res.data)
  },
  retry: (id: number) => api.post<unknown>(`/api/admin/subscriptions/renewals/${id}/retry`),
  cancel: (id: number) => api.post<unknown>(`/api/admin/subscriptions/renewals/${id}/cancel`),
  extendGracePeriod: (id: number, data: { days: number; note?: string }) => 
    api.post<unknown>(`/api/subscriptions/${id}/extend-grace-period`, data),
}

// Admin - Webhooks
// Admin - Webhooks
export const webhooksApi = {
  list: async (params?: Record<string, unknown>): Promise<any> => {
    const res = await api.get<ApiResponse<unknown>>("/api/webhooks", { params: params as Record<string, string | number | boolean> })
    
    return PaginatedSchema(AdminWebhookEventSchema)
      .or(z.array(AdminWebhookEventSchema))
      .parse(res.data)
  },
}

// Admin - Exchange Rates
// Admin - Exchange Rates
export const exchangeRatesApi = {
  getLatest: () => api.get<ExchangeRate>("/api/admin/exchange-rates"),
  getPublic: () => api.get<ExchangeRate>("/api/exchange-rates/latest"),
  getInfo: () => api.get<any>("/api/admin/exchange-rates/info"),
  refresh: () => api.post<any>("/api/admin/exchange-rates/refresh"),
  updateCache: (cache_minutes: number) => api.put<any>("/api/admin/exchange-rates/settings", { cache_minutes }),
  updateManual: (rate: number) => api.put<any>("/api/admin/exchange-rates/rate", { rate }),
  // Legacy support for ExchangeRatesPage.tsx (mapped to updateManual)
  update: (data: { rates: Record<string, number> }) => {
    const usdRate = data.rates['USD']
    if (usdRate) return api.put<any>("/api/admin/exchange-rates/rate", { rate: usdRate })
    return Promise.resolve({ success: true })
  },
  list: () => api.get<any>("/api/admin/exchange-rates").then(res => [res]), // Mock list as array for current UI
}

// Admin - Blog Management
export const blogApi = {
  posts: {
    list: async (params?: Record<string, unknown>): Promise<any> => {
      const res = await api.get<ApiResponse<unknown>>("/api/admin/blog/posts", { params: params as Record<string, string | number | boolean> })
      
      return PaginatedSchema(AdminPostSchema)
        .or(z.array(AdminPostSchema))
        .parse(res)
    },
    get: async (slug: string): Promise<AdminPost> => {
      const res = await api.get<ApiResponse<unknown>>(`/api/admin/blog/posts/${slug}`)
      return AdminPostSchema.parse(res.data)
    },
    create: (data: unknown) => api.post<unknown>("/api/admin/blog/posts", data),
    update: (slug: string, data: unknown) => api.put<unknown>(`/api/admin/blog/posts/${slug}`, data),
    delete: (slug: string) => api.delete<unknown>(`/api/admin/blog/posts/${slug}`),
    restore: (slug: string) => api.post<unknown>(`/api/admin/blog/posts/${slug}/restore`),
    forceDelete: (slug: string) => api.delete<unknown>(`/api/admin/blog/posts/${slug}/force`),
    publish: (slug: string) => api.post<unknown>(`/api/admin/blog/posts/${slug}/publish`),
    unpublish: (slug: string) => api.post<unknown>(`/api/admin/blog/posts/${slug}/unpublish`),
  },
  categories: {
    list: async (params?: Record<string, unknown>): Promise<any> => {
      const res = await api.get<ApiResponse<unknown>>("/api/admin/blog/categories", { params: params as Record<string, string | number | boolean> })
      return PaginatedSchema(AdminCategorySchema).or(z.array(AdminCategorySchema)).parse(res)
    },
    get: (id: number) => api.get<unknown>(`/api/admin/blog/categories/${id}`),
    create: (data: unknown) => api.post<unknown>("/api/admin/blog/categories", data),
    update: (id: number, data: unknown) => api.put<unknown>(`/api/admin/blog/categories/${id}`, data),
    delete: (id: number) => api.delete<unknown>(`/api/admin/blog/categories/${id}`),
  },
  tags: {
    list: async (params?: Record<string, unknown>): Promise<any> => {
      const res = await api.get<ApiResponse<unknown>>("/api/admin/blog/tags", { params: params as Record<string, string | number | boolean> })
      return PaginatedSchema(AdminTagSchema).or(z.array(AdminTagSchema)).parse(res)
    },
    get: (id: number) => api.get<unknown>(`/api/admin/blog/tags/${id}`),
    create: (data: unknown) => api.post<unknown>("/api/admin/blog/tags", data),
    update: (id: number, data: unknown) => api.put<unknown>(`/api/admin/blog/tags/${id}`, data),
    delete: (id: number) => api.delete<unknown>(`/api/admin/blog/tags/${id}`),
  }
}

// Subscription Plans API
export const plansApi = {
  list: async (params?: Record<string, unknown>): Promise<any> => {
    const res = await api.get<ApiResponse<unknown>>("/api/plans", { params: params as Record<string, string | number | boolean> })
    return z.array(AdminPlanSchema).parse(res.data)
  },
  get: async (id: number): Promise<AdminPlan> => {
    const res = await api.get<ApiResponse<unknown>>(`/api/plans/${id}`)
    return AdminPlanSchema.parse(res.data)
  },
  create: async (data: unknown): Promise<AdminPlan> => {
    const res = await api.post<ApiResponse<unknown>>("/api/plans", data)
    return AdminPlanSchema.parse(res.data)
  },
  update: async (id: number, data: unknown): Promise<AdminPlan> => {
    const res = await api.put<ApiResponse<unknown>>(`/api/plans/${id}`, data)
    return AdminPlanSchema.parse(res.data)
  },
  delete: (id: number) => api.delete<unknown>(`/api/plans/${id}`),
}

// System Settings API
export const systemSettingsApi = {
  list: (params?: { group?: string }) => api.get<Record<string, unknown>>("/api/admin/system-settings", { params }),
  update: (data: Record<string, unknown>) => api.put<unknown>("/api/admin/system-settings", data),
}

// Admin - Donation Campaigns Management
import { 
  DonationCampaignSchema, 
  type CreateCampaignInput, 
  type UpdateCampaignInput 
} from "@/schemas/campaign"

export const campaignAdminApi = {
  list: async (params?: Record<string, unknown>): Promise<any> => {
    const res = await api.get<ApiResponse<unknown>>("/api/admin/donation-campaigns", { 
      params: params as Record<string, string | number | boolean> 
    })
    return res
  },
  
  getCreateMetadata: () => 
    api.get<{ success: boolean; data: { counties: Array<{ id: number; name: string }> } }>("/api/admin/donation-campaigns/create"),
  
  get: async (slug: string) => {
    const res = await api.get<ApiResponse<unknown>>(`/api/admin/donation-campaigns/${slug}`)
    return DonationCampaignSchema.parse(res.data)
  },
  
  getEditData: (slug: string) => 
    api.get<{ success: boolean; data: { campaign: unknown; counties: Array<{ id: number; name: string }> } }>(`/api/admin/donation-campaigns/${slug}/edit`),
  
  create: (data: CreateCampaignInput) => 
    api.post<unknown>("/api/admin/donation-campaigns", data),
  
  update: (slug: string, data: UpdateCampaignInput) => 
    api.put<unknown>(`/api/admin/donation-campaigns/${slug}`, data),
  
  delete: (slug: string) => 
    api.delete<unknown>(`/api/admin/donation-campaigns/${slug}`),
  
  restore: (slug: string) => 
    api.post<unknown>(`/api/admin/donation-campaigns/${slug}/restore`),
  
  publish: (slug: string) => 
    api.post<unknown>(`/api/admin/donation-campaigns/${slug}/publish`),
  
  unpublish: (slug: string) => 
    api.post<unknown>(`/api/admin/donation-campaigns/${slug}/unpublish`),
  
  complete: (slug: string) => 
    api.post<unknown>(`/api/admin/donation-campaigns/${slug}/complete`),
}

// Admin - Donations Management
export const donationAdminApi = {
  list: (params?: { 
    page?: number
    per_page?: number
    status?: string
    campaign_id?: number
    search?: string
    start_date?: string
    end_date?: string
  }) => api.get<{
    success: boolean
    data: Array<{
      id: number
      reference: string
      donor_name: string
      donor_email: string
      amount: number
      currency: string
      status: string
      campaign?: { id: number; title: string; slug: string }
      user?: { id: number; name: string; email: string }
      created_at: string
    }>
    pagination: {
      total: number
      per_page: number
      current_page: number
      last_page: number
    }
  }>("/api/admin/donations", { params: params as Record<string, string | number | boolean> }),

  get: (id: number) => api.get<{
    success: boolean
    data: {
      id: number
      reference: string
      donor_name: string
      donor_email: string
      donor_phone?: string
      amount: number
      currency: string
      status: string
      notes?: string
      county?: { id: number; name: string }
      campaign?: { id: number; title: string; slug: string }
      user?: { id: number; name: string; email: string }
      created_at: string
    }
  }>(`/api/admin/donations/${id}`),

  stats: () => api.get<{
    success: boolean
    data: {
      total_donations: number
      total_amount: number
      paid_count: number
      pending_count: number
      failed_count: number
      campaign_donations: number
      general_donations: number
    }
  }>("/api/admin/donations/stats"),
}

// Bundle everything into adminApi for backward compatibility and convenience
export const adminApi = {
  getMenu: async () => {
    const res = await api.get<ApiResponse<unknown>>("/api/admin/menu")
    return z.array(AdminMenuItemSchema).parse(res.data)
  },
  users: userApi,
  roles: roleApi,
  permissions: permissionApi,
  auditLogs: auditLogApi,
  retention: retentionApi,
  reconciliation: reconciliationApi,
  renewals: renewalsApi,
  webhooks: webhooksApi,
  exchangeRates: exchangeRatesApi,
  blog: blogApi,
  plans: plansApi,
  systemSettings: systemSettingsApi,
  campaigns: campaignAdminApi,
  donations: donationAdminApi,
}

