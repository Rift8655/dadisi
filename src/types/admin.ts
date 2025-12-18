export interface AdminUser {
  id: number
  name?: string | null
  username: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  active_subscription_id?: number | null
  plan_id?: number | null
  subscription_status?: string | null
  subscription_expires_at?: string | null
  last_payment_date?: string | null
  subscription_activated_at?: string | null
  profile_picture_url?: string | null
  roles: AdminRole[]
  member_profile?: AdminMemberProfile | null
}

export interface AdminMemberProfile {
  id: number
  user_id: number
  first_name: string
  last_name: string
  phone_number: string | null
  date_of_birth: string | null
  gender: string | null
  county_id: number | null
  sub_county?: string | null
  ward?: string | null
  interests?: string | null
  bio: string | null
  is_staff?: boolean
  plan_id?: number | null
  plan_type?: string | null
  plan_expires_at?: string | null
  occupation?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  terms_accepted?: boolean
  marketing_consent?: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface AdminRole {
  id: number
  name: string
  guard_name: string
  permissions?: AdminPermission[]
  users_count?: number
  created_at: string
  updated_at: string
}

export interface AdminPermission {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
}

export interface AdminRetentionSetting {
  id: number
  data_type: string
  retention_days: number
  auto_delete: boolean
  description: string
  updated_by: number | null
  updated_by_user?: {
    id: number
    username: string
    email: string
  }
  created_at: string
  updated_at: string
}

export interface AdminAuditLog {
  id: number
  user_id: number | null
  user?: {
    id: number
    username: string
    email: string
  } | null
  model_type: string
  model_id: number
  action: string
  old_values?: Record<string, unknown> | null
  new_values?: Record<string, unknown> | null
  ip_address?: string | null
  user_agent?: string | null
  notes?: string | null
  created_at: string
}

export interface AdminApiResponse<T> {
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
  [key: string]: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page?: number
  from?: number | null
  last_page?: number
  per_page?: number
  to?: number | null
  total?: number
  meta?: {
    current_page: number
    from: number | null
    last_page: number
    per_page: number
    to: number | null
    total: number
  }
}

export interface BulkOperationResult {
  success: number
  failed: number
  errors: Array<{
    user_id: number
    error: string
  }>
}

export interface UserInvitePayload {
  email: string
  username: string
  roles?: string[]
  send_notification?: boolean
}

export interface BulkUserInvitePayload {
  users: UserInvitePayload[]
}

export interface BulkUser {
  email: string
  name?: string
  roles?: string[]
  error?: string
}

export type PermissionCategory =
  | "User Management"
  | "Event Management"
  | "Financial"
  | "Content"
  | "Reports"
  | "Settings"

export const PERMISSION_CATEGORIES: Record<string, PermissionCategory> = {
  manage_users: "User Management",
  view_all_users: "User Management",
  assign_roles: "User Management",
  manage_permissions: "User Management",
  manage_roles: "User Management",
  create_events: "Event Management",
  edit_events: "Event Management",
  delete_events: "Event Management",
  view_all_events: "Event Management",
  manage_event_attendees: "Event Management",
  view_donation_ledger: "Financial",
  export_donations: "Financial",
  reconcile_payments: "Financial",
  create_posts: "Content",
  edit_posts: "Content",
  publish_posts: "Content",
  delete_posts: "Content",
  view_reports: "Reports",
  manage_own_profile: "Settings",
  rsvp_events: "Event Management",
  make_donations: "Financial",
}

export const BUILT_IN_ROLES = [
  "super_admin",
  "admin",
  "finance",
  "events_manager",
  "content_editor",
  "member",
]

export interface AdminRenewalJob {
  id: number
  subscription_id: number
  user_id: number
  user?: {
    id: number
    name: string
    email: string
  }
  plan_name?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  attempts: number
  last_attempt_at: string | null
  next_attempt_at: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface AdminWebhookEvent {
  id: number
  provider: string
  event_type: string
  payload: Record<string, unknown>
  status: 'processed' | 'failed' | 'ignored'
  error: string | null
  processed_at: string | null
  created_at: string
}

export interface ExchangeRate {
  id: number
  currency_code: string
  rate: number
  is_active: boolean
  updated_at: string
}

export interface AdminCategory {
  id: number
  name: string
  slug: string
  description: string | null
}

export interface AdminTag {
  id: number
  name: string
  slug: string
}

export interface AdminPost {
  id: number
  user_id: number
  county_id: number | null
  title: string
  slug: string
  excerpt?: string | null
  body: string
  status: "draft" | "published"
  published_at: string | null
  hero_image_path?: string | null
  meta_title?: string | null
  meta_description?: string | null
  is_featured: boolean
  views_count: number
  created_at: string
  updated_at: string
  deleted_at?: string | null
  author?: {
    id: number
    username: string
    display_name?: string
  }
  categories?: AdminCategory[]
  tags?: AdminTag[]
  county?: {
    id: number
    name: string
  } | null
}

