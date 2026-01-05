import { z } from "zod"

// System Feature Schema (built-in features)
export const SystemFeatureSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  value_type: z.enum(["number", "boolean"]),
  default_value: z.string(),
  is_active: z.boolean().optional(),
  sort_order: z.number().optional(),
})

export type SystemFeature = z.infer<typeof SystemFeatureSchema>

// System Feature for a Plan (with pivot data)
export const PlanSystemFeatureSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  value: z.string(),
  display_name: z.string().optional().nullable(),
  display_description: z.string().optional().nullable(),
  value_type: z.enum(["number", "boolean"]),
})

export type PlanSystemFeature = z.infer<typeof PlanSystemFeatureSchema>

// System Feature input for create/update plan
export const SystemFeatureInputSchema = z.object({
  id: z.number(),
  value: z.string(),
  display_name: z.string().optional().nullable(),
  display_description: z.string().optional().nullable(),
})

export type SystemFeatureInput = z.infer<typeof SystemFeatureInputSchema>

// Base Plan Schema (as used in simple lists)
export const PlanSchema = z.object({
  id: z.number(),
  // Backend may return localized name object { en: string } or a simple string
  name: z.union([z.string(), z.object({ en: z.string() })]),
  // Price may be provided directly for simplified lists, or nested under `pricing`
  price: z.number().optional(),
  active: z.boolean().optional(),
  is_active: z.boolean().optional(),
  requires_student_approval: z.boolean().optional(),
  description: z.string().optional(),
  interval: z.string().optional(),
  // Add flexible fields for admin view compatibility if needed
  features: z.array(z.any()).optional(),
  system_features: z.array(PlanSystemFeatureSchema).optional(),
  promotions: z.any().optional(),
  monthly_promotion: z
    .object({
      discount_percent: z.number(),
      expires_at: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  yearly_promotion: z
    .object({
      discount_percent: z.number(),
      expires_at: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  pricing: z
    .object({
      kes: z
        .object({
          base_monthly: z.number(),
          discounted_monthly: z.number().optional(),
          base_yearly: z.number().optional(),
          discounted_yearly: z.number().optional(),
        })
        .optional(),
      usd: z
        .object({
          base_monthly: z.number().optional(),
          discounted_monthly: z.number().optional(),
          base_yearly: z.number().optional(),
          discounted_yearly: z.number().optional(),
        })
        .optional(),
      exchange_rate: z.number().optional(),
      last_updated: z.string().optional(),
    })
    .optional(),
})

export const PlansArraySchema = z.array(PlanSchema)

export type Plan = z.infer<typeof PlanSchema>

// Admin Form Schemas
export const PlanPromotionSchema = z.object({
  discount_percent: z.coerce.number().min(0).max(100),
  expires_at: z.string().optional().nullable(),
})

// Feature schema for plan features with limits (legacy)
export const PlanFeatureSchema = z.object({
  name: z.string().min(1, "Feature name is required"),
  limit: z.coerce.number().int().min(-1).nullable().optional(), // -1 = unlimited, null = boolean/enabled
  description: z.string().max(500).optional(),
})

export type PlanFeature = z.infer<typeof PlanFeatureSchema>

export const AdminPlanFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  monthly_price_kes: z.coerce.number().min(0, "Price must be positive"),
  currency: z.string().default("KES"),
  // Promotions
  monthly_promotion: PlanPromotionSchema.nullable().optional(),
  yearly_promotion: PlanPromotionSchema.nullable().optional(),
  // Features as array of objects with name, limit, and description (legacy)
  features: z.array(PlanFeatureSchema).optional(),
  // Display Features - simple string array for UI display only
  display_features: z.array(z.string()).optional().default([]),
  // System Features (new built-in features)
  system_features: z.array(SystemFeatureInputSchema).optional(),
  is_active: z.boolean().default(true),
  requires_student_approval: z.boolean().default(false),
})

export type AdminPlanFormValues = z.infer<typeof AdminPlanFormSchema>

export const CreateSubscriptionSchema = z.object({
  plan_id: z.number(),
  billing_interval: z.enum(["monthly", "yearly"]),
})

export type CreateSubscriptionPayload = z.infer<typeof CreateSubscriptionSchema>
