export interface AdminUser {
  id: number
  name?: string | null
  username: string
  email: string
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  active_subscription_id?: number | null
  plan_id?: number | null
  subscription_status?: string | null
  subscription_expires_at?: string | null
  last_payment_date?: string | null
  subscription_activated_at?: string | null
  profile_picture_url?: string | null
  roles?: AdminRole[]
  member_profile?: AdminMemberProfile | null
}

export interface AdminMemberProfile {
  id: number
  user_id: number
  first_name?: string | null
  last_name?: string | null
  phone_number?: string | null
  date_of_birth?: string | null
  gender?: string | null
  county_id?: number | null
  sub_county?: string | null
  ward?: string | null
  interests?: string | null
  bio?: string | null
  is_staff?: boolean
  plan_id?: number | null
  plan_type?: string | null
  plan_expires_at?: string | null
  occupation?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  terms_accepted?: boolean
  marketing_consent?: boolean
  created_at?: string
  updated_at?: string
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
  view_student_approvals: "User Management",
  approve_student_approvals: "User Management",
  reject_student_approvals: "User Management",
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
  status: "pending" | "processing" | "completed" | "failed"
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
  status: "processed" | "failed" | "ignored"
  error: string | null
  processed_at: string | null
  created_at: string
}

export interface ExchangeRate {
  id: number
  from_currency: string
  to_currency: string
  rate: string | number
  inverse_rate: string | number
  cache_minutes: number
  last_updated: string
  created_at?: string
  updated_at?: string
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
  likes_count?: number
  dislikes_count?: number
  comments_count?: number
  allow_comments?: boolean
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
  media?: AdminMedia[]
  gallery_images?: AdminMedia[]
  featured_media?: AdminMedia | null
}

export interface AdminMedia {
  id: number
  file_name: string
  file_path: string
  url?: string
  mime_type?: string
  file_size?: number
  type?: string
  is_featured?: boolean
}

export interface AdminPlan {
  id: number
  name: string | Record<string, string>
  slug?: string
  description?: string | Record<string, string> | null
  is_active?: boolean
  price?: string | number
  base_monthly_price?: string | number
  currency?: string
  pricing?: {
    kes: {
      base_monthly: number
      discounted_monthly: number
      base_yearly: number
      discounted_yearly: number
    }
    usd: {
      base_monthly: number
      discounted_monthly: number
      base_yearly: number
      discounted_yearly: number
    }
    exchange_rate: number
    last_updated: string
  }
  promotions?: {
    monthly: {
      discount_percent: number
      expires_at: string
      active: boolean
      time_remaining?: string | null
    } | null
    yearly: {
      discount_percent: number
      expires_at: string
      active: boolean
      time_remaining?: string | null
    } | null
  }
  features?: Array<{
    id: number
    name: string | Record<string, string>
    limit?: number | null
  }>
}
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

export interface PesapalSettings {
  environment: string
  consumer_key: string
  consumer_secret: string
  callback_url: string
  webhook_url: string
}

export interface AdminStudentApprovalRequest {
  id: number
  user_id: number
  user_name: string
  user_email?: string
  status: "pending" | "approved" | "rejected"
  student_institution: string
  student_email: string
  student_birth_date?: string | null
  county: string
  documentation_url: string
  additional_notes?: string | null
  submitted_at: string
  reviewed_at?: string | null
  reviewed_by?: number | null
  rejection_reason?: string | null
  admin_notes?: string | null
  expires_at: string
}

export interface FinanceRevenueData {
  date: string
  total_revenue: string | number
  transaction_count: number
  [key: string]: any
}

export interface FinanceRefundData {
  date: string
  total_refunded: string | number
  refund_count: number
  [key: string]: any
}

export interface FinanceCategoryData {
  label: string
  total: number
  count: number
  [key: string]: any
}

export interface AdminFinanceAnalytics {
  revenue: FinanceRevenueData[]
  refunds: FinanceRefundData[]
  categories: FinanceCategoryData[]
  period: string
}

export interface AdminPayment {
  id: number
  payable_type: string
  payable_id: number
  payer_id: number | null
  payer?: {
    id: number
    username: string
    email: string
    name?: string
  } | null
  gateway: string
  method?: string | null
  status: string
  amount: string | number
  currency: string
  description?: string | null
  reference: string
  external_reference?: string | null
  order_reference?: string | null
  transaction_id?: string | null
  pesapal_order_id?: string | null
  receipt_url?: string | null
  paid_at?: string | null
  refunded_at?: string | null
  created_at: string
  updated_at: string
}
