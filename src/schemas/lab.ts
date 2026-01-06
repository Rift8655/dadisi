import { z } from "zod"

/**
 * Lab Space Booking Zod Schemas
 */

// Enums
export const LabSpaceTypeSchema = z.enum([
  "wet_lab",
  "dry_lab",
  "greenhouse",
  "mobile_lab",
  "makerspace",
  "workshop",
  "studio",
  "other",
])
export const LabBookingStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "completed",
  "no_show",
  "no_show",
])
export const LabSlotTypeSchema = z.enum(["hourly", "half_day", "full_day"])

// Lab Space Schema
export const LabSpaceSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  type: LabSpaceTypeSchema,
  type_name: z.string(),
  description: z.string().nullable(),
  capacity: z.coerce.number(),
  image_path: z.string().nullable(),
  image_url: z.string().nullable(),
  amenities: z.array(z.string()).default([]),
  safety_requirements: z.array(z.string()).default([]),
  rules: z.string().nullable().optional(),
  location: z.string().nullable(),
  county: z.string().nullable(),
  is_active: z.boolean().default(true),
  is_available: z.boolean().optional(),
  featured_media_id: z.number().nullable().optional(),
  gallery_media_ids: z.array(z.number()).optional(),
  featured_media: z
    .object({
      id: z.number(),
      url: z.string(),
      file_name: z.string().optional(),
    })
    .nullable()
    .optional(),
  available_from: z.string().nullable().optional(),
  available_until: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

// Lab Booking Schema
export const LabBookingSchema = z.object({
  id: z.number(),
  lab_space_id: z.coerce.number(),
  user_id: z.coerce.number(),
  title: z.string().nullable(),
  purpose: z.string(),
  starts_at: z.string(),
  ends_at: z.string(),
  slot_type: LabSlotTypeSchema.default("hourly"),
  recurrence_rule: z.string().nullable(),
  recurrence_parent_id: z.coerce.number().nullable(),
  status: LabBookingStatusSchema.default("pending"),
  admin_notes: z.string().nullable(),
  rejection_reason: z.string().nullable(),
  checked_in_at: z.string().nullable(),
  checked_out_at: z.string().nullable(),
  actual_duration_hours: z.coerce.number().nullable(),
  quota_consumed: z.boolean().default(false),

  // Computed attributes
  duration_hours: z.coerce.number().optional(),
  is_cancellable: z.boolean().optional(),
  can_check_in: z.boolean().optional(),
  can_check_out: z.boolean().optional(),
  is_past_grace_period: z.boolean().optional(),
  status_color: z.string().optional(),

  // Relations
  lab_space: LabSpaceSchema.optional(),
  user: z
    .object({
      id: z.number(),
      username: z.string(),
      email: z.string().optional(),
    })
    .optional(),

  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

// Quota Status Schema
export const LabQuotaStatusSchema = z.object({
  has_access: z.boolean(),
  reason: z.enum(["no_subscription", "plan_not_eligible"]).optional(),
  plan_name: z.string().optional(),
  limit: z.coerce.number().nullable().optional(),
  unlimited: z.boolean().optional(),
  used: z.coerce.number().optional(),
  remaining: z.coerce.number().nullable().optional(),
  resets_at: z.string().optional(),
})

// Availability Event Schema
export const LabAvailabilityEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  start: z.string(),
  end: z.string(),
  type: z.enum(["booking", "maintenance"]),
  status: LabBookingStatusSchema.optional(),
  user: z.string().optional(),
  reason: z.string().optional(),
})

// Request Schemas
export const CreateLabBookingSchema = z.object({
  lab_space_id: z.coerce.number().min(1, "Please select a lab space"),
  starts_at: z.string().min(1, "Start time is required"),
  ends_at: z.string().min(1, "End time is required"),
  purpose: z
    .string()
    .min(10, "Purpose must be at least 10 characters")
    .max(1000),
  title: z.string().max(255).optional(),
  slot_type: LabSlotTypeSchema.default("hourly"),
})

// Response Schemas
export const LabSpaceListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(LabSpaceSchema),
})

export const LabBookingListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(LabBookingSchema),
})

export const LabQuotaResponseSchema = z.object({
  success: z.boolean(),
  data: LabQuotaStatusSchema,
})

export const CreateLabBookingResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: LabBookingSchema,
})

export const LabAvailabilityResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    space: LabSpaceSchema.pick({
      id: true,
      name: true,
      slug: true,
      type: true,
      capacity: true,
    }),
    events: z.array(LabAvailabilityEventSchema),
  }),
})

// Type exports from schemas
export type LabSpaceSchemaType = z.infer<typeof LabSpaceSchema>
export type LabBookingSchemaType = z.infer<typeof LabBookingSchema>
export type LabQuotaStatusSchemaType = z.infer<typeof LabQuotaStatusSchema>
export type CreateLabBookingSchemaType = z.infer<typeof CreateLabBookingSchema>
