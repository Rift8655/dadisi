export type SiteConfig = {
  name: string
  author: string
  description: string
  keywords: Array<string>
  url: {
    base: string
    author: string
  }
  links: {
    github: string
  }
  ogImage: string
}

export interface RetentionSetting {
  id: number
  data_type: string
  retention_days: number
  auto_delete: boolean
  description: string
  updated_by: number | null
  updated_by_user?: {
    username: string
  }
  created_at: string
  updated_at: string
}

export interface County {
  id: number
  name: string
}

export interface MemberProfile {
  id: number
  user_id: number
  first_name: string
  last_name: string
  phone_number: string | null
  date_of_birth: string | null
  gender: string | null
  county_id: number | null
  sub_county: string | null
  ward: string | null
  interests: string[] | null
  bio: string | null
  is_staff: boolean
  membership_type?: number | null
  plan_id?: number | null
  plan_type?: string | null
  plan_expires_at?: string | null
  occupation: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  terms_accepted: boolean
  marketing_consent: boolean
  created_at: string
  updated_at: string
  county?: County
  user?: {
    id: number
    username: string
    email: string
    email_verified_at: string | null
    profile_picture_url?: string | null
  }
  deleted_at?: string | null
  subscription_plan?: {
    id: number
    name: string
    slug: string
    description?: string
    price: number
  }
}

export interface MemberProfileResponse {
  success: boolean
  data: MemberProfile
}

export interface CountiesResponse {
  success: boolean
  data: County[]
}

export interface Plan {
  id: number
  name: string
  slug: string
  description: string
  price: number
  currency: string
  billing_interval: "monthly" | "yearly"
  features: string[]
  is_active: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: number
  user_id: number
  plan_id: number
  plan: Plan
  status:
    | "active"
    | "canceled"
    | "cancelled"
    | "expired"
    | "past_due"
    | "pending"
    | "payment_pending"
  starts_at: string
  ends_at: string | null
  canceled_at: string | null
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface EventCategory {
  id: number
  name: string
  slug: string
  description: string | null
  parent_id: number | null
  image_path?: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  parent?: EventCategory
  children?: EventCategory[]
}

export interface EventTag {
  id: number
  name: string
  slug: string
}

export interface Ticket {
  id: number
  event_id: number
  name: string
  description: string | null
  price: number
  currency: string
  capacity: number | null
  quantity?: number | null
  is_active: boolean
  is_sold_out: boolean
  available_until: string | null
}

export interface Speaker {
  id: number
  event_id: number
  name: string
  company: string | null
  designation: string | null
  bio: string | null
  photo_url: string | null
  photo_path?: string | null
  website_url?: string | null
  linkedin_url?: string | null
  is_featured: boolean
  photo_media?: Media | null
}

export interface Registration {
  id: number
  event_id: number
  user_id: number
  ticket_id: number
  confirmation_code: string
  status: "pending" | "confirmed" | "attended" | "cancelled" | "waitlisted"
  check_in_at: string | null
  waitlist_position: number | null
  qr_code_token?: string
  qr_code_url: string | null
  created_at: string
  event?: Event
  user?: {
    id: number
    username: string
    email: string
    profile_picture_url?: string | null
  }
  ticket?: Ticket
}

export interface PromoCode {
  id: number
  event_id: number | null
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  usage_limit: number | null
  used_count: number
  valid_from: string | null
  valid_until: string | null
  is_active: boolean
}

export interface Event {
  id: number
  title: string
  slug: string
  description: string
  category?: EventCategory
  venue: string | null
  is_online: boolean
  online_link: string | null
  capacity: number | null
  waitlist_enabled: boolean
  waitlist_capacity: number | null
  county?: County
  image_url: string | null
  image_path: string | null
  price: number
  currency: string
  status:
    | "draft"
    | "published"
    | "suspended"
    | "pending_approval"
    | "rejected"
    | "cancelled"

  featured: boolean
  featured_until: string | null
  registration_deadline: string | null
  starts_at: string
  ends_at: string | null
  creator?: {
    id: number
    username: string
    email: string
  }
  tickets?: Ticket[]
  speakers?: Speaker[]
  tags?: EventTag[]
  registrations_count?: number
  featured_media_id?: number | null
  gallery_media_ids?: number[]
  featured_media?: Media | null
  gallery_media?: Media[]
  hero_image_url?: string | null
  is_attending?: boolean
  created_at: string
  updated_at: string
}

export interface Post {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image: string | null
  author_id: number
  author?: {
    id: number
    username: string
  }
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  tags?: string[]
  likes_count?: number
  dislikes_count?: number
  comments_count?: number
  allow_comments?: boolean
}

export interface Donation {
  id: number
  user_id: number | null
  amount: number
  currency: string
  status: "pending" | "completed" | "failed"
  payment_method: string | null
  transaction_reference: string | null
  donor_name: string | null
  donor_email: string | null
  campaign_id?: number | null
  is_anonymous: boolean
  message: string | null
  created_at: string
  updated_at: string
  county?: County
  county_id?: number
}

export interface Media {
  id: number
  file_name?: string
  file_path?: string
  type?: string
  mime_type?: string
  size?: number
  visibility?: "public" | "private" | "shared"
  share_token?: string | null
  allow_download?: boolean
  is_public?: boolean
  url?: string
  original_url?: string
  attached_to?: string | null
  attached_to_id?: number | null
  owner?: {
    id: number
    name?: string
  }
  created_at?: string
  updated_at?: string
}
