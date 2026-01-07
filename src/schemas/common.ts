import { z } from "zod"

export const CountySchema = z.object({ id: z.number(), name: z.string() })
export const CountiesResponseSchema = z.object({ data: z.array(CountySchema) })

export const MemberProfileSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z.string().nullable(),
  date_of_birth: z.string().nullable(),
  gender: z.string().nullable(),
  county_id: z.number().nullable(),
  bio: z.string().nullable(),
  avatar_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const MemberProfileResponseSchema = z.object({
  data: MemberProfileSchema,
})

export const DonationSchema = z.object({
  id: z.number(),
  amount: z.number(),
  redirect_url: z.string().optional(),
})

export const MediaSchema = z.object({
  id: z.number(),
  url: z.string().optional(),
  original_url: z.string().optional(),
  file_name: z.string().optional(),
  mime_type: z.string().optional(),
  file_size: z.coerce.number().optional(),
  size: z.coerce.number().optional(),
  type: z.string().optional(),
  visibility: z.enum(["public", "private", "shared"]).optional(),
  share_token: z.string().optional().nullable(),
  allow_download: z.boolean().optional(),
  updated_at: z.string().optional(),
  file_path: z.string().optional(),
  pivot: z
    .object({
      role: z.string().optional(),
      attachable_type: z.string().optional(),
      attachable_id: z.coerce.number().optional(),
      media_id: z.coerce.number().optional(),
    })
    .optional(),
})
export const MediaListSchema = z.object({ data: z.array(MediaSchema) })

export const LoginResponseSchema = z.object({
  user: z.any(),
  access_token: z.string(),
  email_verified: z.boolean().optional(),
})

export default {
  CountySchema,
  CountiesResponseSchema,
  MemberProfileSchema,
  MemberProfileResponseSchema,
  DonationSchema,
  MediaSchema,
  MediaListSchema,
  LoginResponseSchema,
}
