import { z } from "zod"

// Base Plan Schema (as used in simple lists)
export const PlanSchema = z.object({
  id: z.number(),
  // Backend may return localized name object { en: string } or a simple string
  name: z.union([z.string(), z.object({ en: z.string() })]),
  // Price may be provided directly for simplified lists, or nested under `pricing`
  price: z.number().optional(),
  active: z.boolean().optional(),
  is_active: z.boolean().optional(),
  description: z.string().optional(),
  interval: z.string().optional(),
  // Add flexible fields for admin view compatibility if needed
  features: z.array(z.any()).optional(),
  promotions: z.any().optional(),
  monthly_promotion: z.object({
    discount_percent: z.number(),
    expires_at: z.string().nullable().optional(),
  }).nullable().optional(),
  yearly_promotion: z.object({
    discount_percent: z.number(),
    expires_at: z.string().nullable().optional(),
  }).nullable().optional(),
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

// Feature schema for plan features with limits
export const PlanFeatureSchema = z.object({
  name: z.string().min(1, "Feature name is required"),
  limit: z.coerce.number().int().min(-1).nullable().optional(), // -1 = unlimited, null = boolean/enabled
  description: z.string().max(500).optional(),
})

export type PlanFeature = z.infer<typeof PlanFeatureSchema>

export const AdminPlanFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  monthly_price_kes: z.coerce.number().min(0, "Price must be positive"),
  currency: z.string().default("KES"),
  // Promotions
  monthly_promotion: PlanPromotionSchema.nullable().optional(),
  yearly_promotion: PlanPromotionSchema.nullable().optional(),
  // Features as array of objects with name, limit, and description
  features: z.array(PlanFeatureSchema).optional(),
  is_active: z.boolean().default(true),
})

export type AdminPlanFormValues = z.infer<typeof AdminPlanFormSchema>

export const CreateSubscriptionSchema = z.object({
  plan_id: z.number(),
  billing_interval: z.enum(["monthly", "yearly"]),
})

export type CreateSubscriptionPayload = z.infer<typeof CreateSubscriptionSchema>
