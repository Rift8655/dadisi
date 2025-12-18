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
  status: "active" | "canceled" | "expired" | "past_due" | "pending"
  starts_at: string
  ends_at: string | null
  canceled_at: string | null
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: number
  title: string
  slug: string
  description: string
  content: string | null
  cover_image: string | null
  starts_at: string
  ends_at: string | null
  location: string | null
  is_virtual: boolean
  meeting_link: string | null
  capacity: number | null
  price: number
  currency: string
  is_published: boolean
  organizer_id: number
  created_at: string
  updated_at: string
  attendees_count?: number
  is_attending?: boolean
  county?: County
  county_id: number
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
  model_type: string
  model_id: number
  collection_name: string
  name: string
  file_name: string
  mime_type: string
  size: number
  original_url: string
  preview_url: string
  created_at: string
  updated_at: string
}
