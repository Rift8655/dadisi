import { z } from "zod"

export const CountySchema = z.object({
  id: z.number(),
  name: z.string(),
}).passthrough()

export const MemberProfileSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  county_id: z.number().nullable().optional(),
  sub_county: z.string().nullable().optional(),
  ward: z.string().nullable().optional(),
  interests: z.array(z.string()).nullable().optional(),
  bio: z.string().nullable().optional(),
  is_staff: z.boolean().default(false).optional(),
  membership_type: z.number().nullable().optional(),
  plan_id: z.number().nullable().optional(),
  plan_type: z.string().nullable().optional(),
  plan_expires_at: z.string().nullable().optional(),
  occupation: z.string().nullable().optional(),
  emergency_contact_name: z.string().nullable().optional(),
  emergency_contact_phone: z.string().nullable().optional(),
  terms_accepted: z.boolean().default(false).optional(),
  marketing_consent: z.boolean().default(false).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().nullable().optional(),
  county: CountySchema.nullable().optional(),
  subscription_plan: z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    slug: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    price: z.number().nullable().optional(),
  }).passthrough().nullable().optional(),
  user: z
    .object({
      id: z.number(),
      name: z.string().nullable().optional(),
      username: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      email_verified_at: z.string().nullable().optional(),
      profile_picture_url: z.string().nullable().optional(),
    })
    .passthrough()
    .nullable()
    .optional(),
}).passthrough()

export const CountiesArraySchema = z.array(CountySchema)

export type MemberProfile = z.infer<typeof MemberProfileSchema>
export type County = z.infer<typeof CountySchema>
