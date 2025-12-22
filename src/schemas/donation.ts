import { z } from "zod"

export const DonationSchema = z.object({
  id: z.number(),
  user_id: z.number().nullable(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(["pending", "completed", "failed"]),
  payment_method: z.string().nullable(),
  transaction_reference: z.string().nullable(),
  donor_name: z.string().nullable(),
  donor_email: z.string().nullable(),
  campaign_id: z.number().nullable().optional(),
  is_anonymous: z.boolean(),
  message: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const CreateDonationSchema = z.object({
  amount: z.number().min(1),
  currency: z.string().default("KES"),
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone_number: z.string().optional(),
  message: z.string().optional(),
  is_anonymous: z.boolean().optional(),
  campaign_id: z.number().optional(),
  transaction_reference: z.string().optional(), // For manual testing or specialized flows
  county_id: z.number().optional(),
})

export type Donation = z.infer<typeof DonationSchema>
export type CreateDonationPayload = z.infer<typeof CreateDonationSchema>
