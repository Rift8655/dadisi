import { z } from "zod"
import {
  LoginResponseSchema,
  SignupResponseSchema,
  UserSchema,
  SendResetEmailSchema,
  ResetPasswordSchema,
} from "@/schemas/auth"
import {
  MemberProfileResponseSchema,
  CountiesResponseSchema,
  MemberProfileSchema,
} from "@/schemas/common" // Using common for now as confirmed in analysis, or switch to memberProfile.ts if preferred. Let's use specific files where possible.
// Wait, I saw memberProfile.ts has MemberProfileSchema too. Use that.
import {
  MemberProfileSchema as MemberProfileSchemaFull,
  CountiesArraySchema,
} from "@/schemas/memberProfile"
import {
  PostsArraySchema,
  PostSchema,
  PaginatedPostsResponseSchema,
  PublicCategoriesResponseSchema,
  PublicTagsResponseSchema,
} from "@/schemas/post"
import {
  EventsListSchema,
  EventSchema,
} from "@/schemas/event"
import {
  PlansArraySchema,
  PlanSchema,
  AdminPlanFormSchema,
  CreateSubscriptionSchema
} from "@/schemas/plan"
import {
  DonationSchema,
} from "@/schemas/common" // donation.ts exists, I should probably check it but "common" was used.
import {
  MediaListSchema,
  MediaSchema,
} from "@/schemas/common"
import {
  ForumThread,
  ForumCategory,
  ForumPost,
  ForumTag,
  Group,
} from "@/schemas/forum"

// Re-imports for specific types if needed, but Zod inference is better.

const baseURL =
  process.env.NEXT_PUBLIC_BACKEND_APP_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000"

export interface ApiResponse<T> {
  success?: boolean
  data?: T
  message?: string
  error?: string
  [key: string]: unknown
}

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { params, ...requestOptions } = options

  // Build URL with query parameters
  let url = `${baseURL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value))
      }
    })
    url += `?${searchParams.toString()}`
  }

  // Set default headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }

  // Handle multipart/form-data: remove Content-Type to let browser set boundary
  if (requestOptions.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  // Add authorization header if available
  try {
    if (typeof window !== "undefined") {
      try {
        const authModule = await import("@/store/auth")
        const token = authModule.useAuth.getState().token
        if (token) headers.Authorization = `Bearer ${token}`
      } catch (e) {
        // dynamic import failed or not available in this environment; fallback to localStorage
        const authStorage = localStorage.getItem("auth-storage")
        if (authStorage) {
          const authState = JSON.parse(authStorage)
          const token = authState.state?.token
          if (token) headers.Authorization = `Bearer ${token}`
        }
      }
    }
  } catch (e) {
    console.error("Failed to read auth token:", e)
  }

  const response = await fetch(url, {
    ...requestOptions,
    headers: { ...headers, ...requestOptions.headers },
  })

  // Handle responses with no content (204 No Content, etc.)
  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    if (!response.ok) {
      const error = new Error(
        `HTTP ${response.status}: ${response.statusText}`
      ) as Error & {
        status?: number
        data?: unknown
      }
      error.status = response.status
      throw error
    }
    return undefined as T
  }

  const contentType = response.headers.get("content-type")
  const isJson = contentType?.includes("application/json")
  let data: unknown

  try {
    data = isJson ? await response.json() : await response.text()
  } catch (e) {
    // If parsing fails, treat as empty response
    data = null
  }

  if (!response.ok) {
    let errorMessage =
      (data as any)?.message || `HTTP ${response.status}: ${response.statusText}`

    if (response.status === 401) {
      errorMessage = "Your session has expired. Please log in again."
      // Automatically logout on 401 and redirect to login
      if (typeof window !== "undefined") {
        import("@/store/auth")
          .then((mod) => mod.useAuth.getState().logout())
          .then(() => {
            // Only redirect if not already on auth pages
            if (!window.location.pathname.startsWith('/auth')) {
              const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
              window.location.href = `/auth/login?expired=true&redirect=${returnUrl}`;
            }
          })
          .catch((err) => console.error("Failed to auto-logout:", err))
      }
    } else if (response.status === 403) {
      errorMessage = "You do not have permission to access this resource."
    }

    const error = new Error(errorMessage) as Error & {
      status?: number
      data?: unknown
    }
    error.status = response.status
    error.data = data
    throw error
  }

  return data as T
}

/**
 * Zod-aware fetch helper.
 * Validates the response against the schema and returns the parsed data.
 */
export async function apiRequestWithSchema<T>(
  endpoint: string,
  schema: z.ZodSchema<T>,
  options: ApiRequestOptions = {}
): Promise<T> {
  const res = await apiRequest<unknown>(endpoint, options)
  const result = schema.safeParse(res)
  if (!result.success) {
    console.error(`[API Schema Error] ${endpoint}:`, result.error.errors)
    throw new Error(`Schema validation failed: ${result.error.message}`)
  }
  return result.data
}

// Low-level API access if needed (prefer exported domain APIs)
export const api = {
  get: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: (body &&
        (typeof FormData !== "undefined" && body instanceof FormData
          ? body
          : JSON.stringify(body))) as BodyInit,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: (body &&
        (typeof FormData !== "undefined" && body instanceof FormData
          ? body
          : JSON.stringify(body))) as BodyInit,
    }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: (body &&
        (typeof FormData !== "undefined" && body instanceof FormData
          ? body
          : JSON.stringify(body))) as BodyInit,
    }),

  delete: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
}

// --- Domain Specific APIs ---

// Auth API
export const authApi = {
  signup: (data: unknown) =>
    apiRequestWithSchema(
      "/api/auth/signup",
      SignupResponseSchema,
      { method: "POST", body: JSON.stringify(data) }
    ),
  
  login: (data: unknown) =>
    apiRequestWithSchema(
      "/api/auth/login",
      LoginResponseSchema,
      { method: "POST", body: JSON.stringify(data) }
    ),
    
  getUser: () => 
    apiRequestWithSchema("/api/auth/user", UserSchema),

  getMe: () => 
    apiRequestWithSchema("/api/auth/me", UserSchema),

  logout: () => api.post("/api/auth/logout"),
    
  sendVerification: () => api.post("/api/auth/send-verification"),
  
  changePassword: (data: unknown) => api.post("/api/auth/password/change", data),
  
  sendResetEmail: (data: { email: string }) =>
    apiRequestWithSchema("/api/auth/password/email", SendResetEmailSchema, {
       method: "POST", body: JSON.stringify(data) 
    }),
    
  resetPassword: (data: { email: string; password: string; password_confirmation: string; token: string }) =>
    apiRequestWithSchema("/api/auth/password/reset", ResetPasswordSchema, {
       method: "POST", body: JSON.stringify(data)
    }),
    
  verifyEmail: (data: { code: string }) =>
    api.post<{ message: string; token: string; user: unknown }>("/api/auth/verify-email", data),

  // Token refresh for silent token rotation
  refresh: () =>
    api.post<{ user: unknown; access_token: string; expires_at: string }>("/api/auth/refresh"),

  // ========================================
  // Two-Factor Authentication (TOTP)
  // ========================================
  twoFactor: {
    // Enable TOTP - returns secret and QR code URL
    enable: () =>
      api.post<{ secret: string; qr_code_url: string }>("/api/auth/2fa/totp/enable"),

    // Verify TOTP code and fully enable 2FA
    verify: (code: string) =>
      api.post<{ message: string; recovery_codes: string[] }>("/api/auth/2fa/totp/verify", { code }),

    // Disable TOTP (requires password)
    disable: (password: string) =>
      api.post<{ message: string }>("/api/auth/2fa/totp/disable", { password }),

    // Validate TOTP code at login (no auth required)
    validateCode: (data: { email: string; code: string }) =>
      api.post<{ user: unknown; access_token: string }>("/api/auth/2fa/totp/validate", data),

    // Get recovery codes (requires password)
    recoveryCodes: (password: string) =>
      api.post<{ recovery_codes: string[] }>("/api/auth/2fa/totp/recovery-codes", { password }),

    // Regenerate recovery codes (requires password)
    regenerateRecoveryCodes: (password: string) =>
      api.post<{ recovery_codes: string[] }>("/api/auth/2fa/totp/regenerate-recovery-codes", { password }),
  },

  // ========================================
  // Passkeys (WebAuthn)
  // ========================================
  passkeys: {
    // Get registration options (authenticated)
    registerOptions: () =>
      api.post<{
        challenge: string
        rp: { id: string; name: string }
        user: { id: string; name: string; displayName: string }
        pubKeyCredParams: Array<{ type: string; alg: number }>
        timeout: number
        attestation: string
        authenticatorSelection: { residentKey: string; userVerification: string }
      }>("/api/auth/passkeys/register/options"),

    // Register a new passkey
    register: (data: { name: string; credential: unknown }) =>
      api.post<{ message: string; passkey: { id: number; name: string; created_at: string } }>(
        "/api/auth/passkeys/register",
        data
      ),

    // List user's passkeys
    list: () =>
      api.get<{
        passkeys: Array<{ id: number; name: string; created_at: string; last_used_at: string | null }>
      }>("/api/auth/passkeys"),

    // Delete a passkey
    delete: (id: number) =>
      api.delete<{ message: string }>(`/api/auth/passkeys/${id}`),

    // Get authentication options (for login - no auth required)
    authenticateOptions: (email?: string) =>
      api.post<{
        challenge: string
        timeout: number
        rpId: string
        allowCredentials: Array<{ type: string; id: string }>
      }>("/api/auth/passkeys/authenticate/options", email ? { email } : {}),

    // Authenticate with passkey (login)
    authenticate: (data: { id: string; response: unknown }) =>
      api.post<{ user: unknown; access_token: string }>("/api/auth/passkeys/authenticate", data),
  },
}

export const userApi = {
  uploadProfilePicture: (data: FormData) =>
    api.post<{
      success: boolean
      data: {
        profile_picture_url: string
        user: unknown
      }
    }>("/api/users/self/profile-picture", data),
}

// Plans API
const PlansResponseSchema = z.object({ data: PlansArraySchema })
const SinglePlanResponseSchema = z.object({ data: PlanSchema })

export const plansApi = {
  getAll: async () => {
    const res = await apiRequestWithSchema("/api/plans", PlansResponseSchema)
    return res.data
  },
  // Admin mutations
  create: (data: unknown) => api.post("/api/plans", data),
  update: (id: number, data: unknown) => api.put(`/api/plans/${id}`, data),
  remove: (id: number) => api.delete(`/api/plans/${id}`),
}

// Subscriptions API
export const subscriptionsApi = {
  create: (data: z.infer<typeof CreateSubscriptionSchema>) =>
    api.post("/api/subscriptions", data),

  // Get current user's subscription
  current: () =>
    api.get<{
      success: boolean
      data: {
        user_id: number
        plan: {
          id: number
          name: string | { en: string }
          description?: string | { en: string }
          price: number
        } | null
        subscription: {
          id: number
          starts_at: string
          ends_at: string
          canceled_at?: string | null
          cancels_at?: string | null
        } | null
        enhancement: {
          status: string
          grace_period_ends_at?: string | null
        } | null
      }
    }>("/api/subscriptions/current"),

  // Get subscription status
  status: () =>
    api.get<{
      success: boolean
      data: {
        current_status: string
        status_details: any
        enhancements: any[]
        history: any[]
      }
    }>("/api/subscriptions/status"),

  // Cancel subscription
  cancel: (reason?: string) =>
    api.post<{ success: boolean; message: string }>("/api/subscriptions/cancel", { reason }),

  // Get renewal preferences
  getRenewalPreferences: () =>
    api.get<{ success: boolean; data: any }>("/api/subscriptions/renewal-preferences"),

  // Update renewal preferences
  updateRenewalPreferences: (data: {
    renewal_type?: "automatic" | "manual"
    send_renewal_reminders?: boolean
    reminder_days_before?: number
    preferred_payment_method?: string
    auto_switch_to_free_on_expiry?: boolean
  }) =>
    api.put<{ success: boolean; message: string; data: any }>("/api/subscriptions/renewal-preferences", data),

  // Initiate payment for subscription
  initiatePayment: (data: { plan_id: number; billing_period?: "month" | "year"; phone?: string }) =>
    api.post<{
      success: boolean
      data: {
        transaction_id: string
        redirect_url: string
        order_tracking_id?: string
      }
    }>("/api/subscriptions/initiate-payment", data),
}

// Counties API (public read access)
export const countiesApi = {
  list: async () => {
    const res = await apiRequestWithSchema("/api/counties", CountiesWrapper)
    return res.data
  },
  get: (id: number) => api.get<{ data: { id: number; name: string } }>(`/api/counties/${id}`),
}

// Member Profile API
// Note: Schemas in memberProfile.ts are exact schemas, but API usually wraps in { data: ... }
// I'll define wrappers locally if they don't exist
const MemberProfileWrapper = z.object({ data: MemberProfileSchemaFull })
const CountiesWrapper = z.object({ data: CountiesArraySchema })

export const memberProfileApi = {
  getMe: async () => {
    const res = await apiRequestWithSchema("/api/member-profiles/me", MemberProfileWrapper)
    return res.data
  },

  // @deprecated - use countiesApi.list() instead
  getCounties: async () => {
    const res = await apiRequestWithSchema("/api/counties", CountiesWrapper)
    return res.data
  },

  update: async (id: number, data: Partial<z.infer<typeof MemberProfileSchemaFull>>) => {
     const res = await apiRequestWithSchema(
       `/api/member-profiles/${id}`, 
       MemberProfileWrapper, 
       { method: "PUT", body: JSON.stringify(data) }
     )
     return res.data
  },

  uploadProfilePicture: (data: FormData) =>
    api.post<{
      success: boolean
      data: {
        profile_picture_url: string
        user: unknown
      }
    }>("/api/member-profiles/profile-picture", data),
}

// Posts API

export interface PostsListParams {
  page?: number
  per_page?: number
  category_id?: number
  tag_id?: number
  search?: string
  sort?: "latest" | "oldest" | "views"
  [key: string]: string | number | boolean | undefined
}

export const postsApi = {
  list: async (params?: PostsListParams) => {
    const res = await apiRequestWithSchema("/api/blog/posts", PaginatedPostsResponseSchema, { 
      params: params as Record<string, string | number | boolean> 
    })
    return res
  },

  getBySlug: async (slug: string) => {
    const res = await apiRequestWithSchema(`/api/blog/posts/${slug}`, z.object({ success: z.literal(true), data: PostSchema }))
    return res.data
  },

  getCategories: async () => {
    const res = await apiRequestWithSchema("/api/blog/categories", PublicCategoriesResponseSchema)
    return res.data
  },

  getTags: async () => {
    const res = await apiRequestWithSchema("/api/blog/tags", PublicTagsResponseSchema)
    return res.data
  },
}

// Events API
export const eventsApi = {
  list: async (params?: any) => {
    const res = await apiRequestWithSchema("/api/events", EventsListSchema, { params })
    return res
  },

  get: async (slugOrId: string | number) => {
    const res = await api.get<{ data: any }>(`/api/events/${slugOrId}`)
    return res.data || res
  },

  // Get event categories
  getCategories: async () => {
    const res = await api.get<{ data: Array<{ id: number; name: string; slug: string }> }>("/api/event-categories")
    return res.data || []
  },

  // Get event tags
  getTags: async () => {
    const res = await api.get<{ data: Array<{ id: number; name: string; slug: string }> }>("/api/event-tags")
    return res.data || []
  },

  // Validate promo code
  validatePromo: async (eventId: number, data: { code: string; ticket_id: number }) => {
    return api.post<{ valid: boolean; discount_percent?: number; discount_amount?: number; message?: string }>(
      `/api/events/${eventId}/validate-promo`,
      data
    )
  },

  // Get organizer's own events
  my: async (params?: { status?: string; page?: number }) => {
    const res = await api.get<{ data: any[] }>("/api/events/my", { params })
    return res.data || []
  },

  // Create new event
  create: async (data: any) => {
    const res = await api.post<{ data: any }>("/api/events", data)
    return res.data
  },

  // Update existing event
  update: async (id: number, data: any) => {
    const res = await api.put<{ data: any }>(`/api/events/${id}`, data)
    return res.data
  },

  // Delete event
  delete: async (id: number) => {
    return api.delete(`/api/events/${id}`)
  },

  // Register for event
  register: (eventId: number, data: { ticket_id: number; additional_data?: any }) =>
    api.post<any>(`/api/events/${eventId}/register`, data),

  rsvp: (id: number, data: unknown) => api.post(`/api/events/${id}/rsvp`, data),

  getAttendanceStats: (eventId: number) => 
    api.get<any>(`/api/events/${eventId}/attendance-stats`),

  // Scan RSVP registration (free events)
  scanTicket: (eventId: number, token: string) => 
    api.post<any>(`/api/events/${eventId}/scan`, { token }),

  // Scan paid ticket order (paid events)
  scanPaidTicket: (eventId: number, qrToken: string) =>
    api.post<{ success: boolean; message: string; order?: any }>(`/api/events/${eventId}/scan-ticket`, { qr_token: qrToken }),
}

// Donations API
export const donationsApi = {
  create: async (data: {
    amount: number
    currency?: string
    first_name: string
    last_name: string
    email: string
    phone_number?: string
    message?: string
    county_id?: number
  }) => {
    return api.post<{
      success: boolean
      message: string
      data: {
        donation_id: number
        reference: string
        amount: number
        currency: string
        redirect_url: string
      }
    }>("/api/donations", data)
  },

  list: async (params?: { page?: number; per_page?: number }) => {
    return api.get<{
      success: boolean
      data: Array<{
        id: number
        reference: string
        donor_name: string
        amount: number
        currency: string
        status: string
        campaign?: { id: number; title: string; slug: string }
        created_at: string
      }>
      pagination: {
        total: number
        per_page: number
        current_page: number
        last_page: number
      }
    }>("/api/donations", { params })
  },

  getByReference: async (reference: string) => {
    return api.get<{
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
        created_at: string
      }
    }>(`/api/donations/ref/${reference}`)
  },
}

// Media API
export const mediaApi = {
  list: async (params?: { page?: number; type?: string }) => {
    const res = await apiRequestWithSchema("/api/media", MediaListSchema, { params })
    return res.data
  },
  
  upload: (data: FormData) => api.post("/api/media", data),

  get: async (id: number) => {
    const res = await apiRequestWithSchema(`/api/media/${id}`, z.object({ data: MediaSchema }))
    return res.data
  },

  delete: (id: number) => api.delete(`/api/media/${id}`),
}

// Author Posts API (for user dashboard blog management)
export const authorPostsApi = {
  list: (params?: { page?: number; status?: string; search?: string }) =>
    api.get<unknown>("/api/user/blog/posts", { params }),
  
  getCreateMetadata: () =>
    api.get<unknown>("/api/user/blog/posts/create"),
  
  get: async (slug: string) => {
    const res = await api.get<any>(`/api/user/blog/posts/${slug}`)
    return res.data
  },
  
  getEditMetadata: (slug: string) =>
    api.get<unknown>(`/api/user/blog/posts/${slug}/edit`),
  
  create: (data: unknown) =>
    api.post<unknown>("/api/user/blog/posts", data),
  
  update: (slug: string, data: unknown) =>
    api.put<unknown>(`/api/user/blog/posts/${slug}`, data),
  
  delete: (slug: string) =>
    api.delete<unknown>(`/api/user/blog/posts/${slug}`),
  
  restore: (slug: string) =>
    api.post<unknown>(`/api/user/blog/posts/${slug}/restore`),
  
  publish: (slug: string) =>
    api.post<unknown>(`/api/user/blog/posts/${slug}/publish`),
  
  unpublish: (slug: string) =>
    api.post<unknown>(`/api/user/blog/posts/${slug}/unpublish`),
}

// Donation Campaigns API (public)
import {
  CampaignListResponseSchema,
  CampaignResponseSchema,
  type CampaignDonationInput,
} from "@/schemas/campaign"

export const campaignsApi = {
  list: async (params?: { page?: number; county_id?: number }) => {
    const res = await apiRequestWithSchema(
      "/api/donation-campaigns",
      CampaignListResponseSchema,
      { params }
    )
    return res
  },

  getBySlug: async (slug: string) => {
    const res = await apiRequestWithSchema(
      `/api/donation-campaigns/${slug}`,
      CampaignResponseSchema
    )
    return res.data
  },

  donate: (slug: string, data: CampaignDonationInput) =>
    api.post<{
      success: boolean
      message: string
      data: {
        donation_id: number
        reference: string
        amount: number
        currency: string
        campaign: { id: number; title: string; slug: string }
        redirect_url: string
      }
    }>(`/api/donation-campaigns/${slug}/donate`, data),
}

// Author Blog Management - categories and tags
export const authorBlogApi = {
  categories: {
    list: () => api.get<any>("/api/user/blog/categories"),
    create: (data: { name: string; description?: string }) =>
      api.post<any>("/api/user/blog/categories", data),
    update: (id: number, data: { name: string; description?: string }) =>
      api.put<any>(`/api/user/blog/categories/${id}`, data),
    requestDelete: (id: number) =>
      api.post<any>(`/api/user/blog/categories/${id}/request-delete`),
  },
  tags: {
    list: () => api.get<any>("/api/user/blog/tags"),
    create: (data: { name: string }) =>
      api.post<any>("/api/user/blog/tags", data),
    update: (id: number, data: { name: string }) =>
      api.put<any>(`/api/user/blog/tags/${id}`, data),
    requestDelete: (id: number) =>
      api.post<any>(`/api/user/blog/tags/${id}/request-delete`),
  },
}

// Messaging API
export interface PrivateMessage {
  id: string
  sender_id: number
  sender_username: string
  recipient_id: number
  created_at: string
}

export interface Conversation {
  partner: {
    id: number
    username: string
    profile_picture_path: string | null
  }
  last_message_at: string | null
  unread_count: number
}

export const messageApi = {
  conversations: () => api.get<Conversation[]>("/api/messages/conversations"),
  
  getConversation: (partnerId: number) => 
    api.get<{ data: PrivateMessage[] }>(`/api/messages/conversation/${partnerId}`),
  
  send: (data: {
    recipient_id: number
    r2_object_key: string
    encrypted_key_package: string
    nonce: string
  }) => api.post("/api/messages/send", data),
  
  getVaultUrl: (messageId: string) =>
    api.get<{ download_url: string; encrypted_key_package: string; nonce: string }>(
      `/api/messages/${messageId}/vault`
    ),
    
  getUploadUrl: () => 
    api.get<{ upload_url: string; object_key: string }>("/api/messages/upload-url"),
    
  keys: {
    get: (userId: number) => 
      api.get<{ public_key: string }>(`/api/messages/keys/${userId}`),
    store: (publicKeyJwk: string) => 
      api.post("/api/messages/keys", { public_key: publicKeyJwk }),
  },
}

// Forum API


export const forumApi = {
  // Categories
  categories: {
    list: () => api.get<{ data: ForumCategory[] }>("/api/forum/categories"),
    get: (slug: string) => api.get<{ data: ForumCategory }>(`/api/forum/categories/${slug}`),
    create: (data: { name: string; description: string; color?: string; icon?: string; order?: number }) =>
      api.post<{ data: ForumCategory }>("/api/forum/categories", data),
    update: (slug: string, data: { name?: string; description?: string; color?: string; icon?: string; order?: number }) =>
      api.put<{ data: ForumCategory }>(`/api/forum/categories/${slug}`, data),
    delete: (slug: string) => api.delete(`/api/forum/categories/${slug}`),
  },

  // Threads
  threads: {
    // List threads within a specific category
    list: (categorySlug: string, params?: { page?: number }) =>
      api.get<{ data: ForumThread[]; meta?: any }>(`/api/forum/categories/${categorySlug}/threads`, { params }),
    // List ALL threads across all categories (for Recent page)
    listAll: (params?: { page?: number; per_page?: number }) =>
      api.get<{ data: ForumThread[]; meta?: any; links?: any; current_page?: number; last_page?: number }>("/api/forum/threads", { params }),
    get: (slug: string) => api.get<{ thread: ForumThread; posts: any }>(`/api/forum/threads/${slug}`),
    create: (categorySlug: string, data: { title: string; content: string; county_id?: number }) =>
      api.post<{ data: ForumThread }>(`/api/forum/categories/${categorySlug}/threads`, data),
    update: (slug: string, data: { title?: string; content?: string }) =>
      api.put<{ data: ForumThread }>(`/api/forum/threads/${slug}`, data),
    delete: (slug: string) => api.delete(`/api/forum/threads/${slug}`),
    pin: (slug: string) => api.post(`/api/forum/threads/${slug}/pin`),
    unpin: (slug: string) => api.post(`/api/forum/threads/${slug}/unpin`),
    lock: (slug: string) => api.post(`/api/forum/threads/${slug}/lock`),
    unlock: (slug: string) => api.post(`/api/forum/threads/${slug}/unlock`),
  },

  // Posts (replies)
  posts: {
    list: (threadSlug: string, params?: { page?: number }) =>
      api.get<{ data: ForumPost[]; meta?: any }>(`/api/forum/threads/${threadSlug}/posts`, { params }),
    create: (threadSlug: string, data: { content: string; parent_id?: number }) =>
      api.post<{ data: ForumPost }>(`/api/forum/threads/${threadSlug}/posts`, data),
    update: (id: number, data: { content: string }) =>
      api.put<{ data: ForumPost }>(`/api/forum/posts/${id}`, data),
    delete: (id: number) => api.delete(`/api/forum/posts/${id}`),
  },

  // Tags
  tags: {
    list: (params?: { search?: string; sort?: string }) =>
      api.get<{ data: ForumTag[] }>("/api/forum/tags", { params }),
    get: (slug: string, params?: { page?: number; per_page?: number }) =>
      api.get<{ tag: ForumTag; threads: { data: ForumThread[]; current_page: number; last_page: number } }>(`/api/forum/tags/${slug}`, { params }),
    create: (data: { name: string; color: string; description?: string }) =>
      api.post<{ data: ForumTag }>("/api/forum/tags", data),
    update: (id: number, data: { name?: string; color?: string; description?: string }) =>
      api.put<{ data: ForumTag }>(`/api/forum/tags/${id}`, data),
    delete: (id: number) => api.delete(`/api/forum/tags/${id}`),
  },

  // Users (member directory)
  users: {
    list: (params?: { search?: string; sort?: string; page?: number; per_page?: number }) =>
      api.get<{ data: ForumUser[]; current_page: number; last_page: number }>("/api/forum/users", { params }),
  },
}

// Forum User type for directory
export interface ForumUser {
  id: number
  username: string
  profile_picture_url: string | null
  joined_at: string
  thread_count: number
  post_count: number
  total_contributions: number
}

// Public Profile type
export interface PublicProfile {
  id: number
  username: string
  profile_picture_url: string | null
  joined_at?: string
  thread_count?: number
  post_count?: number
  bio?: string | null
  location?: string
  interests?: string[]
  occupation?: string
  email?: string
}

// Privacy Settings type
export interface PrivacySettings {
  public_profile_enabled: boolean
  public_bio: string | null
  show_email: boolean
  show_location: boolean
  show_join_date: boolean
  show_post_count: boolean
  show_interests: boolean
  show_occupation: boolean
}

// Public Profile API
export const publicProfileApi = {
  // Get user's public profile
  get: (username: string) =>
    api.get<{ data: PublicProfile }>(`/api/users/${username}/public`),

  // Get own privacy settings
  getPrivacySettings: () =>
    api.get<{ data: PrivacySettings }>("/api/profile/privacy-settings"),

  // Update own privacy settings
  updatePrivacySettings: (data: Partial<PrivacySettings>) =>
    api.put<{ data: PrivacySettings; message: string }>("/api/profile/privacy-settings", data),

  // Preview own public profile
  preview: () =>
    api.get<{ data: PublicProfile }>("/api/profile/preview"),
}


export const groupsApi = {
  list: (params?: { county_id?: number; search?: string; per_page?: number }) =>
    api.get<{ data: Group[]; meta?: { total: number } }>("/api/groups", { params }),
  
  show: (slug: string) =>
    api.get<{ data: Group & { members: any[]; recent_discussions: any[] } }>(`/api/groups/${slug}`),
  
  members: (slug: string, params?: { per_page?: number }) =>
    api.get<{ data: any[]; meta?: any }>(`/api/groups/${slug}/members`, { params }),
  
  join: (slug: string) =>
    api.post<{ message: string }>(`/api/groups/${slug}/join`),
  
  leave: (slug: string) =>
    api.post<{ message: string }>(`/api/groups/${slug}/leave`),
}

// Lab Spaces API (public browsing)
import type {
  LabSpace,
  LabBooking,
  LabQuotaStatus,
  LabAvailabilityResponse,
  CreateLabBookingRequest,
} from "@/types/lab"

export const labSpacesApi = {
  // List all active lab spaces
  list: (params?: { type?: string; search?: string }) =>
    api.get<{ success: boolean; data: LabSpace[] }>("/api/spaces", { params }),

  // Get lab space details by slug
  get: (slug: string) =>
    api.get<{ success: boolean; data: LabSpace }>(`/api/spaces/${slug}`),

  // Get availability calendar for a lab space
  availability: (slug: string, params?: { start?: string; end?: string }) =>
    api.get<{ success: boolean; data: LabAvailabilityResponse }>(`/api/spaces/${slug}/availability`, { params }),
}

// Lab Bookings API (authenticated)
export const labBookingsApi = {
  // Get user's quota status
  getQuota: () =>
    api.get<{ success: boolean; data: LabQuotaStatus }>("/api/bookings/quota"),

  // List user's bookings
  list: (params?: { status?: string; upcoming?: boolean }) =>
    api.get<{ success: boolean; data: LabBooking[] }>("/api/bookings", { params }),

  // Get booking details
  get: (id: number) =>
    api.get<{ success: boolean; data: LabBooking }>(`/api/bookings/${id}`),

  // Create a new booking
  create: (data: CreateLabBookingRequest) =>
    api.post<{ success: boolean; message: string; data: LabBooking }>("/api/bookings", data),

  // Cancel a booking
  cancel: (id: number) =>
    api.delete<{ success: boolean; message: string; data: LabBooking }>(`/api/bookings/${id}`),
}

// Event Ticket Orders API
export interface PurchaseTicketRequest {
  quantity: number
  name?: string // Required for guest checkout
  email?: string // Required for guest checkout
  phone?: string
  promo_code?: string
}

export interface TicketOrderResponse {
  id: number
  reference: string
  total_amount: number
  original_amount?: number
  promo_discount?: number
  subscriber_discount?: number
  payment_required: boolean
  redirect_url?: string | null
  qr_code_token?: string
}

export interface TicketOrder {
  id: number
  reference: string
  qr_code_token: string
  quantity: number
  unit_price: number
  original_amount: number
  promo_discount: number
  subscriber_discount: number
  total_amount: number
  currency: string
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  purchased_at: string | null
  checked_in_at: string | null
  event: {
    id: number
    title: string
    slug: string
    starts_at: string
    venue?: string
  }
  promo_code?: string
}

export const eventOrdersApi = {
  // Purchase tickets for an event (supports guest checkout)
  purchase: (eventId: number, data: PurchaseTicketRequest) =>
    api.post<{ success: boolean; message: string; data: TicketOrderResponse }>(`/api/events/${eventId}/purchase`, data),

  // Check payment status by order reference
  checkStatus: (reference: string) =>
    api.get<{ success: boolean; data: { status: string; paid: boolean; qr_code_token?: string; event: { id: number; title: string; starts_at: string } } }>(`/api/event-orders/status/${reference}`),

  // Get user's purchased tickets
  myTickets: (params?: { status?: string }) =>
    api.get<{ success: boolean; data: TicketOrder[]; meta: { current_page: number; last_page: number; total: number } }>("/api/my-tickets", { params }),

  // Get ticket order details
  get: (orderId: number) =>
    api.get<{ success: boolean; data: TicketOrder }>(`/api/event-orders/${orderId}`),
}

// ============= Notifications API =============

export interface AppNotification {
  id: string
  type: string
  data: {
    type: string
    title: string
    message: string
    link?: string
    [key: string]: unknown
  }
  read_at: string | null
  created_at: string
}

export interface NotificationsResponse {
  success: boolean
  data: {
    data: AppNotification[]
    current_page: number
    last_page: number
    total: number
  }
  unread_count: number
}

export const notificationsApi = {
  // Get all notifications (paginated)
  list: (params?: { unread_only?: boolean; per_page?: number; page?: number }) =>
    api.get<NotificationsResponse>("/api/notifications", { params }),

  // Get unread notification count
  unreadCount: () =>
    api.get<{ success: boolean; data: { unread_count: number } }>("/api/notifications/unread-count"),

  // Mark a notification as read
  markAsRead: (id: string) =>
    api.post<{ success: boolean; message: string }>(`/api/notifications/${id}/read`),

  // Mark all notifications as read
  markAllAsRead: () =>
    api.post<{ success: boolean; message: string; data: { marked_count: number } }>("/api/notifications/mark-all-read"),

  // Delete a notification
  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/api/notifications/${id}`),

  // Clear all notifications
  clearAll: () =>
    api.post<{ success: boolean; message: string; data: { deleted_count: number } }>("/api/notifications/clear-all"),
}

export default api


