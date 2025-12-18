import { z } from "zod"

// Base Plan Schema (as used in simple lists)
export const PlanSchema = z.object({
  id: z.number(),
  // Backend may return localized name object { en: string } or a simple string
  name: z.union([z.string(), z.object({ en: z.string() })]),
  // Price may be provided directly for simplified lists, or nested under `pricing`
  price: z.number().optional(),
  active: z.boolean().optional(),
  description: z.string().optional(),
  interval: z.string().optional(),
  // Add flexible fields for admin view compatibility if needed
  features: z.array(z.any()).optional(),
  promotions: z.any().optional(),
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

export const AdminPlanFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  monthly_price_kes: z.coerce.number().min(0, "Price must be positive"),
  currency: z.string().default("KES"),
  // Promotions
  monthly_promotion: PlanPromotionSchema.nullable().optional(),
  yearly_promotion: PlanPromotionSchema.nullable().optional(),
  // Features (handling both string creation and object updates preference)
  // We'll treat features as an array of strings for simple input, allowing API to handle
  features: z.array(z.string()).optional(), 
  is_active: z.boolean().default(true),
})

export type AdminPlanFormValues = z.infer<typeof AdminPlanFormSchema>

export const CreateSubscriptionSchema = z.object({
  plan_id: z.number(),
  billing_interval: z.enum(["monthly", "yearly"]),
})

export type CreateSubscriptionPayload = z.infer<typeof CreateSubscriptionSchema>
