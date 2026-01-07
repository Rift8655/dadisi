import { AdminMenuItemSchema } from "@/contracts/auth.contract"
import {
  AdminAuditLogSchema,
  AdminCategorySchema,
  AdminPermissionSchema,
  AdminPlanSchema,
  AdminPostSchema,
  AdminRenewalJobSchema,
  AdminRetentionSettingSchema,
  AdminRoleSchema,
  AdminTagSchema,
  AdminUserSchema,
  AdminWebhookEventSchema,
  ExchangeRateSchema,
  PaginatedSchema,
} from "@/schemas/admin"
// Admin - Donation Campaigns Management
import {
  DonationCampaignSchema,
  type CreateCampaignInput,
  type UpdateCampaignInput,
} from "@/schemas/campaign"
import * as Sentry from "@sentry/nextjs"
import { z } from "zod"

import type {
  AdminAuditLog,
  AdminFinanceAnalytics,
  AdminPermission,
  AdminPlan,
  AdminPost,
  AdminRenewalJob,
  AdminRole,
  AdminUser,
  BulkUserInvitePayload,
  ExchangeRate,
  UserInvitePayload,
} from "@/types/admin"
import type { RetentionSetting } from "@/types/index"
// Lab Spaces Admin API
import type { AdminLabBookingFilters, LabBooking, LabSpace } from "@/types/lab"
import { api, apiRequestWithSchema, ApiResponse } from "@/lib/api"

// User Management API
// User Management API
export const userApi = {
  list: async (params?: Record<string, unknown>): Promise<any> => {
    const res = await api.get<any>("/api/admin/users", {
      params: params as Record<string, string | number | boolean>,
    })

    // Parse the entire response (which includes data + pagination)
    const schema = PaginatedSchema(AdminUserSchema).or(z.array(AdminUserSchema))
    const result = schema.safeParse(res)

    if (!result.success) {
      Sentry.captureException(result.error, {
        tags: { endpoint: "/api/admin/users", type: "zod_validation" },
        extra: { rawData: res, errors: result.error.errors },
      })
      // Still throw so UI shows error
      throw result.error
    }

    return result.data
  },
  get: async (id: number): Promise<z.infer<typeof AdminUserSchema>> => {
    const res = await api.get<ApiResponse<unknown>>(`/api/admin/users/${id}`)

    const result = AdminUserSchema.safeParse(res.data)
    if (!result.success) {
      Sentry.captureException(result.error, {
        tags: { endpoint: `/api/admin/users/${id}`, type: "zod_validation" },
        extra: { rawData: res.data, errors: result.error.errors },
      })
      throw result.error
    }
    return result.data
  },

  update: (id: number, data: unknown) =>
    api.put<unknown>(`/api/admin/users/${id}`, data),
  delete: (id: number) => api.delete<unknown>(`/api/admin/users/${id}`),
  restore: (id: number) => api.post<unknown>(`/api/admin/users/${id}/restore`),
  forceDelete: (id: number) =>
    api.delete<unknown>(`/api/admin/users/${id}/force`),
  create: (data: {
    username: string
    email: string
    password: string
    first_name?: string
    last_name?: string
    is_staff?: boolean
    roles?: string[]
  }) => api.post<unknown>("/api/admin/users", data),
  invite: (data: UserInvitePayload | unknown) =>
    api.post<unknown>("/api/admin/users/invite", data),
  bulkDelete: (ids: number[]) =>
    api.post<unknown>("/api/admin/users/bulk/delete", { ids }),
  bulkRestore: (ids: number[]) =>
    api.post<unknown>("/api/admin/users/bulk/restore", { ids }),
  bulkAssignRole: (ids: number[], role: string) =>
    api.post<unknown>("/api/admin/users/bulk/assign-role", {
      user_ids: ids,
      role,
    }),
  bulkRemoveRole: (ids: number[], role: string) =>
    api.post<unknown>("/api/admin/users/bulk/remove-role", {
      user_ids: ids,
      role,
    }),
  bulkInvite: (data: BulkUserInvitePayload | { users: unknown[] }) =>
    api.post<unknown>("/api/admin/users/bulk-invite", data),
  syncRoles: (id: number, roles: string[]) =>
    api.post<unknown>(`/api/admin/users/${id}/roles`, { roles }),
  assignRole: (id: number, role: string) =>
    api.post<unknown>(`/api/admin/users/${id}/roles`, { role }),
  removeRole: (id: number, role: string) =>
    api.delete<unknown>(`/api/admin/users/${id}/roles/${role}`),
}

// Role Management API
// Role Management API
export const roleApi = {
  list: async (params?: Record<string, unknown>): Promise<any> => {
    const res = await api.get<ApiResponse<unknown>>("/api/admin/roles", {
      params: params as Record<string, string | number | boolean>,
    })

    return PaginatedSchema(AdminRoleSchema)
      .or(z.array(AdminRoleSchema))
      .parse(res.data)
  },
  get: async (id: number): Promise<z.infer<typeof AdminRoleSchema>> => {
    const res = await api.get<ApiResponse<unknown>>(`/api/admin/roles/${id}`)
    return AdminRoleSchema.parse(res.data)
  },
  update: async (
    id: number,
    data: unknown
  ): Promise<z.infer<typeof AdminRoleSchema>> => {
    const res = await api.put<ApiResponse<unknown>>(
      `/api/admin/roles/${id}`,
      data
    )
    return AdminRoleSchema.parse(res.data)
  },
  create: async (data: unknown): Promise<z.infer<typeof AdminRoleSchema>> => {
    const res = await api.post<ApiResponse<unknown>>("/api/admin/roles", data)
    return AdminRoleSchema.parse(res.data)
  },
  delete: (id: number) => api.delete<unknown>(`/api/admin/roles/${id}`),
  assignPermissions: (id: number, permissions: string[]) =>
    api.post<unknown>(`/api/admin/roles/${id}/permissions`, { permissions }),
}

// Permission Management API
// Permission Management API
export const permissionApi = {
  list: async (params?: Record<string, unknown>): Promise<any> => {
    const res = await api.get<ApiResponse<unknown>>("/api/admin/permissions", {
      params: params as Record<string, string | number | boolean>,
    })

    return PaginatedSchema(AdminPermissionSchema)
      .or(z.array(AdminPermissionSchema))
      .parse(res.data)
  },
  create: async (data: unknown): Promise<AdminPermission> => {
    const res = await api.post<ApiResponse<unknown>>(
      "/api/admin/permissions",
      data
    )
    return AdminPermissionSchema.parse(res.data)
  },
}

// Audit Logs API
// Audit Logs API
export const auditLogApi = {
  list: async (params?: Record<string, unknown>): Promise<any> => {
    const res = await api.get<ApiResponse<unknown>>("/api/admin/audit-logs", {
      params: params as Record<string, string | number | boolean>,
    })

    return PaginatedSchema(AdminAuditLogSchema)
      .or(z.array(AdminAuditLogSchema))
      .parse(res)
  },
}

// Retention Settings API (Admin only)
export const retentionApi = {
  list: (params?: { data_type?: string }) =>
    api.get<unknown>("/api/admin/retention-settings", { params }),

  getOne: (id: number) =>
    api.get<unknown>(`/api/admin/retention-settings/${id}`),

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
    api.get<unknown>("/api/admin/reconciliation/export", {
      params,
      headers: { Accept: "text/csv" },
    }),
}

// Admin - Subscription Management
export const subscriptionsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<any>("/api/admin/subscriptions", {
      params: params as Record<string, string | number | boolean>,
    }),
  get: (id: number) => api.get<any>(`/api/admin/subscriptions/${id}`),
  cancel: (id: number) =>
    api.post<any>(`/api/admin/subscriptions/${id}/cancel`),
}

// Admin - Webhooks
// Admin - Webhooks
export const webhooksApi = {
  list: async (params?: Record<string, unknown>): Promise<any> => {
    const res = await api.get<ApiResponse<unknown>>("/api/webhooks", {
      params: params as Record<string, string | number | boolean>,
    })

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
  updateCache: (cache_minutes: number) =>
    api.put<any>("/api/admin/exchange-rates/settings", { cache_minutes }),
  updateManual: (rate: number) =>
    api.put<any>("/api/admin/exchange-rates/rate", { rate }),
  // Legacy support for ExchangeRatesPage.tsx (mapped to updateManual)
  update: (data: { rates: Record<string, number> }) => {
    const usdRate = data.rates["USD"]
    if (usdRate)
      return api.put<any>("/api/admin/exchange-rates/rate", { rate: usdRate })
    return Promise.resolve({ success: true })
  },
  list: () => api.get<any>("/api/admin/exchange-rates").then((res) => [res]), // Mock list as array for current UI
}

// Admin - Blog Management
export const blogApi = {
  posts: {
    list: async (params?: Record<string, unknown>): Promise<any> => {
      const res = await api.get<ApiResponse<unknown>>("/api/admin/blog/posts", {
        params: params as Record<string, string | number | boolean>,
      })

      return PaginatedSchema(AdminPostSchema)
        .or(z.array(AdminPostSchema))
        .parse(res)
    },
    get: async (slug: string): Promise<AdminPost> => {
      const res = await api.get<ApiResponse<unknown>>(
        `/api/admin/blog/posts/${slug}`
      )
      return AdminPostSchema.parse(res.data)
    },
    create: (data: unknown) => api.post<unknown>("/api/admin/blog/posts", data),
    update: (slug: string, data: unknown) =>
      api.put<unknown>(`/api/admin/blog/posts/${slug}`, data),
    delete: (slug: string) =>
      api.delete<unknown>(`/api/admin/blog/posts/${slug}`),
    restore: (slug: string) =>
      api.post<unknown>(`/api/admin/blog/posts/${slug}/restore`),
    forceDelete: (slug: string) =>
      api.delete<unknown>(`/api/admin/blog/posts/${slug}/force`),
    publish: (slug: string) =>
      api.post<unknown>(`/api/admin/blog/posts/${slug}/publish`),
    unpublish: (slug: string) =>
      api.post<unknown>(`/api/admin/blog/posts/${slug}/unpublish`),
  },
  categories: {
    list: async (params?: Record<string, unknown>): Promise<any> => {
      const res = await api.get<ApiResponse<unknown>>(
        "/api/admin/blog/categories",
        { params: params as Record<string, string | number | boolean> }
      )
      return PaginatedSchema(AdminCategorySchema)
        .or(z.array(AdminCategorySchema))
        .parse(res)
    },
    get: (id: number) => api.get<unknown>(`/api/admin/blog/categories/${id}`),
    create: (data: unknown) =>
      api.post<unknown>("/api/admin/blog/categories", data),
    update: (id: number, data: unknown) =>
      api.put<unknown>(`/api/admin/blog/categories/${id}`, data),
    delete: (id: number) =>
      api.delete<unknown>(`/api/admin/blog/categories/${id}`),
  },
  tags: {
    list: async (params?: Record<string, unknown>): Promise<any> => {
      const res = await api.get<ApiResponse<unknown>>("/api/admin/blog/tags", {
        params: params as Record<string, string | number | boolean>,
      })
      return PaginatedSchema(AdminTagSchema)
        .or(z.array(AdminTagSchema))
        .parse(res)
    },
    get: (id: number) => api.get<unknown>(`/api/admin/blog/tags/${id}`),
    create: (data: unknown) => api.post<unknown>("/api/admin/blog/tags", data),
    update: (id: number, data: unknown) =>
      api.put<unknown>(`/api/admin/blog/tags/${id}`, data),
    delete: (id: number) => api.delete<unknown>(`/api/admin/blog/tags/${id}`),
  },
}

// Subscription Plans API
export const plansApi = {
  list: async (params?: Record<string, unknown>): Promise<any> => {
    const res = await api.get<ApiResponse<unknown>>("/api/plans", {
      params: params as Record<string, string | number | boolean>,
    })
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
  list: async (params?: { group?: string }) => {
    const res = await api.get<{
      success: boolean
      data: Record<string, unknown>
    }>("/api/admin/system-settings", { params })
    return res.data // Extract just the data object
  },
  update: (data: Record<string, unknown>) =>
    api.put<unknown>("/api/admin/system-settings", data),
}

export const campaignAdminApi = {
  list: async (params?: Record<string, unknown>): Promise<any> => {
    const res = await api.get<ApiResponse<unknown>>(
      "/api/admin/donation-campaigns",
      {
        params: params as Record<string, string | number | boolean>,
      }
    )
    return res
  },

  getCreateMetadata: () =>
    api.get<{
      success: boolean
      data: { counties: Array<{ id: number; name: string }> }
    }>("/api/admin/donation-campaigns/create"),

  get: async (slug: string) => {
    const res = await api.get<ApiResponse<unknown>>(
      `/api/admin/donation-campaigns/${slug}`
    )
    return DonationCampaignSchema.parse(res.data)
  },

  getEditData: (slug: string) =>
    api.get<{
      success: boolean
      data: { campaign: unknown; counties: Array<{ id: number; name: string }> }
    }>(`/api/admin/donation-campaigns/${slug}/edit`),

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
  }) =>
    api.get<{
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
    }>("/api/admin/donations", {
      params: params as Record<string, string | number | boolean>,
    }),

  get: (id: number) =>
    api.get<{
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

  stats: () =>
    api.get<{
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

// Counties Admin API
export const countiesAdminApi = {
  create: (data: { name: string }) =>
    api.post<{ data: { id: number; name: string }; message: string }>(
      "/api/counties",
      data
    ),
  update: (id: number, data: { name: string }) =>
    api.put<{ data: { id: number; name: string }; message: string }>(
      `/api/counties/${id}`,
      data
    ),
  delete: (id: number) =>
    api.delete<{ message: string }>(`/api/counties/${id}`),
}

export const labSpacesAdminApi = {
  list: (params?: {
    type?: string
    active?: boolean
    per_page?: number
    page?: number
  }) =>
    api.get<{ success: boolean; data: LabSpace[]; pagination?: any }>(
      "/api/admin/spaces",
      {
        params: params as Record<string, string | number | boolean>,
      }
    ),

  get: (id: number) =>
    api.get<{ success: boolean; data: LabSpace }>(`/api/admin/spaces/${id}`),

  create: (data: Partial<LabSpace>) =>
    api.post<{ success: boolean; message: string; data: LabSpace }>(
      "/api/admin/spaces",
      data
    ),

  update: (id: number, data: Partial<LabSpace>) =>
    api.put<{ success: boolean; message: string; data: LabSpace }>(
      `/api/admin/spaces/${id}`,
      data
    ),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(
      `/api/admin/spaces/${id}`
    ),
}

// Lab Bookings Admin API
export const labBookingsAdminApi = {
  list: (params?: AdminLabBookingFilters) =>
    api.get<{ success: boolean; data: LabBooking[]; pagination?: any }>(
      "/api/admin/lab-bookings",
      {
        params: params as Record<string, string | number | boolean>,
      }
    ),

  get: (id: number) =>
    api.get<{ success: boolean; data: LabBooking }>(
      `/api/admin/lab-bookings/${id}`
    ),

  approve: (id: number, data?: { admin_notes?: string }) =>
    api.post<{ success: boolean; message: string; data: LabBooking }>(
      `/api/admin/lab-bookings/${id}/approve`,
      data || {}
    ),

  reject: (id: number, data: { rejection_reason: string }) =>
    api.post<{ success: boolean; message: string; data: LabBooking }>(
      `/api/admin/lab-bookings/${id}/reject`,
      data
    ),

  checkIn: (id: number) =>
    api.post<{ success: boolean; message: string; data: LabBooking }>(
      `/api/admin/lab-bookings/${id}/check-in`
    ),

  checkOut: (id: number) =>
    api.post<{ success: boolean; message: string; data: LabBooking }>(
      `/api/admin/lab-bookings/${id}/check-out`
    ),

  markNoShow: (id: number) =>
    api.post<{ success: boolean; message: string; data: LabBooking }>(
      `/api/admin/lab-bookings/${id}/no-show`
    ),

  stats: (params?: { period?: string; lab_space_id?: number }) =>
    api.get<{ success: boolean; data: LabBookingStats }>(
      "/api/admin/lab-bookings/stats",
      {
        params: params as Record<string, string | number | boolean>,
      }
    ),
}

// Lab Booking Stats Type
export interface LabBookingStats {
  period: string
  date_range: { from: string; to: string }
  total_bookings: number
  by_status: {
    pending: number
    approved: number
    rejected: number
    completed: number
    no_show: number
    cancelled: number
  }
  hours: {
    total_booked: number
    total_used: number
    average_per_booking: number
  }
  attendance: {
    show_rate: number
    no_show_count: number
    completed_count: number
  }
  top_spaces: Array<{ space: string; slug: string; bookings: number }>
  top_users: Array<{ user: string; email: string; bookings: number }>
}

// Lab Maintenance Block Type
export interface LabMaintenanceBlock {
  id: number
  lab_space_id: number
  title: string
  reason: string | null
  starts_at: string
  ends_at: string
  created_by: number
  created_at?: string
  updated_at?: string
  lab_space?: { id: number; name: string; slug: string }
  creator?: { id: number; username: string }
}

// Lab Maintenance Admin API
export const labMaintenanceAdminApi = {
  list: (params?: {
    lab_space_id?: number
    upcoming?: boolean
    per_page?: number
    page?: number
  }) =>
    api.get<{ success: boolean; data: LabMaintenanceBlock[]; meta?: any }>(
      "/api/admin/lab-maintenance",
      {
        params: params as Record<string, string | number | boolean>,
      }
    ),

  get: (id: number) =>
    api.get<{ success: boolean; data: LabMaintenanceBlock }>(
      `/api/admin/lab-maintenance/${id}`
    ),

  create: (data: {
    lab_space_id: number
    title: string
    reason?: string
    starts_at: string
    ends_at: string
  }) =>
    api.post<{ success: boolean; message: string; data: LabMaintenanceBlock }>(
      "/api/admin/lab-maintenance",
      data
    ),

  update: (
    id: number,
    data: Partial<{
      title: string
      reason: string
      starts_at: string
      ends_at: string
    }>
  ) =>
    api.put<{ success: boolean; message: string; data: LabMaintenanceBlock }>(
      `/api/admin/lab-maintenance/${id}`,
      data
    ),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(
      `/api/admin/lab-maintenance/${id}`
    ),
}

// Admin Events API
export interface AdminEventFilters {
  status?:
    | "all"
    | "draft"
    | "pending_approval"
    | "published"
    | "rejected"
    | "cancelled"
    | "suspended"
  featured?: boolean
  search?: string
  upcoming?: boolean
  sort_by?: "title" | "starts_at" | "status" | "created_at"
  sort_dir?: "asc" | "desc"
  page?: number
  per_page?: number
}

export interface AdminEventStats {
  total: number
  pending_review: number
  published: number
  upcoming: number
  featured: number
}

export const eventsAdminApi = {
  list: (params?: AdminEventFilters) =>
    api.get<any>("/api/admin/events", {
      params: params as Record<string, string | number | boolean>,
    }),

  get: (id: number) => api.get<any>(`/api/admin/events/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post<any>("/api/admin/events", data),

  update: (id: number, data: Record<string, unknown>) =>
    api.put<any>(`/api/admin/events/${id}`, data),

  publish: (id: number) =>
    api.post<{ message: string }>(`/api/admin/events/${id}/publish`),

  cancel: (id: number) =>
    api.post<{ message: string }>(`/api/admin/events/${id}/cancel`),

  suspend: (id: number) =>
    api.post<{ message: string }>(`/api/admin/events/${id}/suspend`),

  feature: (id: number, data?: { until?: string }) =>
    api.post<{ message: string }>(
      `/api/admin/events/${id}/feature`,
      data || {}
    ),

  unfeature: (id: number) =>
    api.post<{ message: string }>(`/api/admin/events/${id}/unfeature`),

  delete: (id: number) => api.delete<void>(`/api/admin/events/${id}`),

  stats: () => api.get<AdminEventStats>("/api/admin/events/stats"),

  registrations: (
    id: number,
    params?: {
      status?: string
      waitlist?: boolean
      page?: number
      per_page?: number
    }
  ) =>
    api.get<any>(`/api/admin/events/${id}/registrations`, {
      params: params as Record<string, string | number | boolean>,
    }),

  listAttendance: (id: number) =>
    api.get<any>(`/api/admin/events/${id}/attendance`),

  attendanceStats: (id: number) =>
    api.get<any>(`/api/admin/events/${id}/attendance/stats`),

  scanAttendance: (id: number, token: string) =>
    api.post<any>(`/api/admin/events/${id}/attendance/scan`, { token }),
}

// Forum Stats
export const forumAdminApi = {
  stats: () => api.get<any>("/api/admin/forum/stats"),
}

// Forum Groups Management
export const groupsApi = {
  list: (params?: {
    search?: string
    active?: boolean
    page?: number
    per_page?: number
  }) => api.get<any>("/api/admin/groups", { params }),
  update: (
    id: number,
    data: {
      name?: string
      description?: string
      is_active?: boolean
      is_private?: boolean
    }
  ) => api.put<any>(`/api/admin/groups/${id}`, data),
  delete: (id: number) => api.delete<any>(`/api/admin/groups/${id}`),
  members: (id: number, params?: { page?: number; per_page?: number }) =>
    api.get<any>(`/api/admin/groups/${id}/members`, { params }),
  removeMember: (groupId: number, userId: number) =>
    api.delete<any>(`/api/admin/groups/${groupId}/members/${userId}`),
}

// System Features API (built-in plan features)
export const systemFeaturesApi = {
  list: (params?: { active?: boolean }) =>
    api.get<any>("/api/admin/system-features", { params }),
  get: (id: number) => api.get<any>(`/api/admin/system-features/${id}`),
  update: (
    id: number,
    data: {
      name?: string
      description?: string
      default_value?: string
      is_active?: boolean
      sort_order?: number
    }
  ) => api.put<any>(`/api/admin/system-features/${id}`, data),
  toggle: (id: number) =>
    api.post<any>(`/api/admin/system-features/${id}/toggle`),
}

// Event Categories Admin API
export const eventCategoriesAdminApi = {
  list: async () => {
    const res = await api.get<{
      data: Array<{
        id: number
        name: string
        slug: string
        color?: string
        description?: string
      }>
    }>("/api/event-categories")
    return res.data || []
  },
  get: async (id: number) => {
    const res = await api.get<{
      data: {
        id: number
        name: string
        slug: string
        color?: string
        description?: string
      }
    }>(`/api/admin/event-categories/${id}`)
    return res.data
  },
  create: (data: { name: string; color?: string; description?: string }) =>
    api.post<any>("/api/admin/event-categories", data),
  update: (
    id: number,
    data: { name?: string; color?: string; description?: string }
  ) => api.put<any>(`/api/admin/event-categories/${id}`, data),
  delete: (id: number) => api.delete<any>(`/api/admin/event-categories/${id}`),
}

// Student Approvals Admin API
export const studentApprovalsAdminApi = {
  list: (params?: { status?: string; county?: string; per_page?: number }) =>
    api.get<any>("/api/student-approvals/requests", { params }),
  get: (id: number) => api.get<any>(`/api/student-approvals/requests/${id}`),
  approve: (id: number, data?: { admin_notes?: string }) =>
    api.post<any>(`/api/student-approvals/requests/${id}/approve`, data),
  reject: (
    id: number,
    data: { rejection_reason: string; admin_notes?: string }
  ) => api.post<any>(`/api/student-approvals/requests/${id}/reject`, data),
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
  webhooks: webhooksApi,
  exchangeRates: exchangeRatesApi,
  blog: blogApi,
  plans: plansApi,
  systemSettings: systemSettingsApi,
  systemFeatures: systemFeaturesApi,
  campaigns: campaignAdminApi,
  donations: donationAdminApi,
  counties: countiesAdminApi,
  labSpaces: labSpacesAdminApi,
  labBookings: labBookingsAdminApi,
  events: eventsAdminApi,
  eventCategories: eventCategoriesAdminApi,
  groups: groupsApi,
  forum: forumAdminApi,
  studentApprovals: studentApprovalsAdminApi,
  subscriptions: subscriptionsApi,
}

// Admin - Finance Management
export const financeApi = {
  payments: {
    list: (params?: Record<string, unknown>) =>
      api.get<any>("/api/admin/finance/payments", {
        params: params as Record<string, string | number | boolean>,
      }),
    get: (id: number) => api.get<any>(`/api/admin/finance/payments/${id}`),
    refund: (id: number, reason: string) =>
      api.post<any>(`/api/admin/finance/payments/${id}/refund`, { reason }),
  },
  analytics: {
    get: (period: string = "month") =>
      api.get<ApiResponse<AdminFinanceAnalytics>>(
        "/api/admin/finance/analytics",
        { params: { period } }
      ),
  },
}
