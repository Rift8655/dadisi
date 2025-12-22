export interface AdminUser {
  id: number
  name: string
  username: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  roles: AdminRole[]
  profile?: AdminMemberProfile
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
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
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
  user_id: number
  user?: {
    id: number
    name: string
    username: string
    email: string
  }
  model: string
  model_id: number
  action: string
  changes: Record<string, unknown>
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  ip_address: string
  user_agent?: string
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
  meta?: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
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
  name?: string
  roles?: string[]
  send_notification?: boolean
}

export interface BulkUserInvitePayload {
  users: UserInvitePayload[]
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
