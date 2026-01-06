import { z } from "zod"

// County schema (reused from existing schemas)
const CountySchema = z.object({
  id: z.number(),
  name: z.string(),
})

// Media schema
const MediaSchema = z.object({
  id: z.number(),
  file_name: z.string().optional(),
  file_path: z.string(),
  url: z.string().optional(),
  original_url: z.string().optional(),
  mime_type: z.string().optional(),
  size: z.number().optional(),
})

// Donation Campaign Schema
export const DonationCampaignSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  short_description: z.string().nullable(),
  goal_amount: z.number().nullable(),
  minimum_amount: z.number().nullable(),
  effective_minimum_amount: z.number().nullable(),
  current_amount: z.number(),
  progress_percentage: z.number(),
  donor_count: z.number(),
  is_goal_reached: z.boolean(),
  currency: z.string(),
  hero_image_url: z.string().nullable(),
  featured_media_id: z.number().nullable().optional(),
  gallery_media_ids: z.array(z.number()).optional(),
  status: z.enum(["draft", "active", "completed", "cancelled"]),
  county: CountySchema.nullable().optional(),
  creator: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
  starts_at: z.string().nullable(),
  ends_at: z.string().nullable(),
  published_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  media: z.array(MediaSchema).optional(),
  featured_media: MediaSchema.nullable().optional(),
})

export const DonationCampaignsArraySchema = z.array(DonationCampaignSchema)

// Campaign list response schema
export const CampaignListResponseSchema = z.object({
  success: z.boolean(),
  data: DonationCampaignsArraySchema,
  pagination: z.object({
    total: z.number(),
    per_page: z.number(),
    current_page: z.number(),
    last_page: z.number(),
  }),
})

// Single campaign response schema
export const CampaignResponseSchema = z.object({
  success: z.boolean(),
  data: DonationCampaignSchema,
})

// Create campaign schema (for forms)
export const CreateCampaignSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  short_description: z.string().max(500).optional().nullable(),
  goal_amount: z.number().min(0).optional().nullable(),
  minimum_amount: z.number().min(0).optional().nullable(),
  currency: z.enum(["KES", "USD"]).default("KES"),
  county_id: z.number().optional().nullable(),
  featured_media_id: z.number().optional().nullable(),
  gallery_media_ids: z.array(z.number()).optional().nullable(),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
  status: z.enum(["draft", "active"]).default("draft"),
})

// Update campaign schema (all fields optional)
export const UpdateCampaignSchema = CreateCampaignSchema.partial()

// Donate to campaign schema
export const CampaignDonationSchema = z.object({
  amount: z.number().min(1, "Amount must be at least 1"),
  currency: z.enum(["KES", "USD"]).default("KES"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone_number: z.string().optional(),
  message: z.string().max(1000).optional(),
  is_anonymous: z.boolean().optional(),
  county_id: z.number().optional(),
})

// Types
export type DonationCampaign = z.infer<typeof DonationCampaignSchema>
export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>
export type CampaignDonationInput = z.infer<typeof CampaignDonationSchema>
