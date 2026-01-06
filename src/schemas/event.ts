import { z } from "zod"

export const EventCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  parent_id: z.number().nullable().optional(),
  image_path: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().optional(),
  children: z.array(z.any()).optional(),
})

export const EventTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
})

export const EventMediaSchema = z.object({
  id: z.number(),
  file_name: z.string().optional(),
  file_path: z.string(),
  url: z.string().optional(),
  original_url: z.string().optional(),
  mime_type: z.string().optional(),
  size: z.number().optional(),
})

export const TicketSchema = z.object({
  id: z.number(),
  event_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  currency: z.string(),
  capacity: z.number().nullable(),
  is_active: z.boolean(),
  is_sold_out: z.boolean(),
  available_until: z.string().nullable(),
})

export const SpeakerSchema = z.object({
  id: z.number(),
  event_id: z.number(),
  name: z.string(),
  company: z.string().nullable(),
  designation: z.string().nullable(),
  bio: z.string().nullable(),
  photo_url: z.string().nullable(),
  website_url: z.string().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  is_featured: z.boolean(),
})

export const EventSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  category: EventCategorySchema.nullable().optional(),
  county: z.object({
    id: z.number(),
    name: z.string()
  }).nullable().optional(),
  venue: z.string().nullable(),
  is_online: z.boolean(),
  online_link: z.string().nullable(),
  capacity: z.number().nullable(),
  waitlist_enabled: z.boolean(),
  waitlist_capacity: z.number().nullable(),
  image_path: z.string().nullable().optional(),
  image_url: z.string().nullable(),
  featured_media_id: z.number().nullable().optional(),
  gallery_media_ids: z.array(z.number()).optional(),
  media: z.array(EventMediaSchema).optional(),
  featured_media: EventMediaSchema.nullable().optional(),
  price: z.number(),
  currency: z.string(),
  status: z.enum(["draft", "published", "suspended"]),
  featured: z.boolean(),
  featured_until: z.string().nullable(),
  registration_deadline: z.string().nullable(),
  starts_at: z.string(),
  ends_at: z.string().nullable(),
  tickets: z.array(TicketSchema).optional(),
  speakers: z.array(SpeakerSchema).optional(),
  tags: z.array(EventTagSchema).optional(),
  creator: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
  registrations_count: z.number().optional(),
  is_attending: z.boolean().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const RegistrationSchema = z.object({
  id: z.number(),
  event_id: z.number(),
  user_id: z.number(),
  ticket_id: z.number(),
  confirmation_code: z.string(),
  status: z.enum(["pending", "confirmed", "attended", "cancelled", "waitlisted"]),
  check_in_at: z.string().nullable(),
  waitlist_position: z.number().nullable(),
  qr_code_url: z.string().nullable(),
  created_at: z.string(),
  event: EventSchema.optional(),
  ticket: TicketSchema.optional(),
})



export const PromoCodeSchema = z.object({
  id: z.number(),
  event_id: z.number().nullable(),
  code: z.string(),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number(),
  usage_limit: z.number().nullable(),
  used_count: z.number(),
  valid_from: z.string().nullable(),
  valid_until: z.string().nullable(),
  is_active: z.boolean(),
})

export const EventsListSchema = z.object({
  data: z.array(EventSchema),
  meta: z.object({
    current_page: z.number(),
    last_page: z.number(),
    total: z.number(),
  }).optional(),
})

// Types inferred from schemas
export type Event = z.infer<typeof EventSchema>
export type EventCategory = z.infer<typeof EventCategorySchema>
export type EventTag = z.infer<typeof EventTagSchema>

export type RsvpPayload = {
  ticket_id: number
  additional_data?: any
}

