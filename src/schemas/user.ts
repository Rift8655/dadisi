import { z } from "zod"

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  email_verified_at: z.string().nullable(),
  profile_picture_path: z.string().nullable().optional(),
  profile_picture_url: z.string().nullable().optional(),
})

export const ProfilePictureUploadSchema = z.object({
  image: z
    .custom<File>((val) => val instanceof File, "Please upload a file")
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Max file size is 5MB"
    )
    .refine(
      (file) => file.type.startsWith("image/"),
      "Please upload a valid image file"
    ),
})

export type User = z.infer<typeof UserSchema>
export type ProfilePictureUploadPayload = z.infer<typeof ProfilePictureUploadSchema>
