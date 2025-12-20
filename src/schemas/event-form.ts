import { z } from "zod"

// Ticket tier input schema
export const TicketInputSchema = z.object({
  id: z.number().optional(), // For editing existing tickets
  name: z.string().min(1, "Ticket name is required").max(100),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or higher"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  is_active: z.boolean().default(true),
})

// Speaker input schema
export const SpeakerInputSchema = z.object({
  id: z.number().optional(), // For editing existing speakers
  name: z.string().min(1, "Speaker name is required").max(100),
  designation: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().optional(),
  is_featured: z.boolean().default(false),
})

// Main event form schema
export const CreateEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  category_id: z.coerce.number().min(1, "Category is required"),
  starts_at: z.string().min(1, "Start date is required"),
  ends_at: z.string().optional(),
  registration_deadline: z.string().optional(),
  
  // Location
  is_online: z.boolean().default(false),
  venue: z.string().optional(),
  online_link: z.string().url().optional().or(z.literal("")),
  county_id: z.coerce.number().optional(),
  
  // Capacity & Pricing
  capacity: z.coerce.number().min(1).optional(),
  waitlist_enabled: z.boolean().default(false),
  waitlist_capacity: z.coerce.number().optional(),
  price: z.coerce.number().min(0).default(0),
  currency: z.string().default("KES"),
  
  // Status
  status: z.enum(["draft", "published"]).default("draft"),
  
  // Tags (array of IDs)
  tag_ids: z.array(z.number()).optional(),
  
  // Tickets
  tickets: z.array(TicketInputSchema).optional(),
  
  // Speakers
  speakers: z.array(SpeakerInputSchema).optional(),
}).refine(
  (data) => {
    // If not online, venue is required
    if (!data.is_online && !data.venue) {
      return false
    }
    return true
  },
  {
    message: "Venue is required for in-person events",
    path: ["venue"],
  }
).refine(
  (data) => {
    // If online, link should be provided
    if (data.is_online && !data.online_link) {
      return false
    }
    return true
  },
  {
    message: "Online link is required for virtual events",
    path: ["online_link"],
  }
)

export type CreateEventInput = z.infer<typeof CreateEventSchema>
export type TicketInput = z.infer<typeof TicketInputSchema>
export type SpeakerInput = z.infer<typeof SpeakerInputSchema>
