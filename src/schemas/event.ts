import { z } from "zod"

export const EventSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  content: z.string().nullable().optional(),
  cover_image: z.string().nullable().optional(),
  starts_at: z.string(),
  ends_at: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  is_virtual: z.boolean(),
  meeting_link: z.string().nullable().optional(),
  capacity: z.number().nullable().optional(),
  price: z.number(),
  currency: z.string(),
  is_published: z.boolean(),
  organizer_id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  county_id: z.number(),
  attendees_count: z.number().optional(),
  is_attending: z.boolean().optional(),
})

export const EventsArraySchema = z.array(EventSchema)

export type Event = z.infer<typeof EventSchema>

export const RsvpSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  guests: z.number().min(0).default(0),
  note: z.string().optional(),
})

export type RsvpPayload = z.infer<typeof RsvpSchema>
