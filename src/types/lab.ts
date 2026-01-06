import type { Media } from "./index"

/**
 * Lab Space Booking Types
 */

export type LabSpaceType = "wet_lab" | "dry_lab" | "greenhouse" | "mobile_lab"

export type LabBookingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed"
  | "no_show"

export type LabSlotType = "hourly" | "half_day" | "full_day"

export interface LabSpace {
  id: number
  name: string
  slug: string
  type: LabSpaceType
  type_name: string
  description: string | null
  capacity: number
  image_path: string | null
  image_url: string | null
  amenities: string[]
  safety_requirements: string[]
  location: string | null
  county: string | null
  is_active: boolean
  featured_media_id?: number | null
  gallery_media_ids?: number[]
  featured_media?: Media | null
  gallery_media?: Media[]
  media?: Media[]
  created_at?: string
  updated_at?: string
}

export interface LabBooking {
  id: number
  lab_space_id: number
  user_id: number
  title: string | null
  purpose: string
  starts_at: string
  ends_at: string
  slot_type: LabSlotType
  recurrence_rule: string | null
  recurrence_parent_id: number | null
  status: LabBookingStatus
  admin_notes: string | null
  rejection_reason: string | null
  checked_in_at: string | null
  checked_out_at: string | null
  actual_duration_hours: number | null
  quota_consumed: boolean

  // Computed attributes
  duration_hours: number
  is_cancellable: boolean
  can_check_in: boolean
  can_check_out: boolean
  is_past_grace_period: boolean
  status_color: string

  // Relations
  lab_space?: LabSpace
  user?: {
    id: number
    username: string
    name?: string
    email?: string
  }

  created_at?: string
  updated_at?: string
}

export interface LabMaintenanceBlock {
  id: number
  lab_space_id: number
  title: string
  reason: string | null
  starts_at: string
  ends_at: string
  recurring: boolean
  recurrence_rule: string | null
  created_by: number
  duration_hours: number
  created_at?: string
  updated_at?: string
}

export interface LabQuotaStatus {
  has_access: boolean
  reason?: "no_subscription" | "plan_not_eligible"
  plan_name?: string
  limit?: number | null
  unlimited?: boolean
  used?: number
  remaining?: number | null
  resets_at?: string
}

export interface LabAvailabilityEvent {
  id: string
  title: string
  start: string
  end: string
  type: "booking" | "maintenance"
  status?: LabBookingStatus
  user?: string
  reason?: string
}

export interface LabAvailabilityResponse {
  space: Pick<LabSpace, "id" | "name" | "slug" | "type" | "capacity">
  events: LabAvailabilityEvent[]
}

// Request/Response types
export interface CreateLabBookingRequest {
  lab_space_id: number
  starts_at: string
  ends_at: string
  purpose: string
  title?: string
  slot_type?: LabSlotType
}

export interface CreateLabBookingResponse {
  success: boolean
  message: string
  data: LabBooking
}

export interface LabSpaceListResponse {
  success: boolean
  data: LabSpace[]
}

export interface LabBookingListResponse {
  success: boolean
  data: LabBooking[]
}

export interface LabQuotaResponse {
  success: boolean
  data: LabQuotaStatus
}

// Admin types
export interface AdminLabBookingFilters {
  status?: LabBookingStatus
  lab_space_id?: number
  user_id?: number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export interface ApproveBookingRequest {
  admin_notes?: string
}

export interface RejectBookingRequest {
  rejection_reason: string
}
