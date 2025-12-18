import { z } from "zod"
import { AdminCategorySchema, AdminTagSchema } from "./admin"

export const PostSchema = z.object({
  id: z.number(),
  user_id: z.number().optional(),
  county_id: z.number().nullable().optional(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable().optional(),
  body: z.string().optional(),
  content: z.string().optional(),
  featured_image: z.string().nullable().optional(),
  author: z
    .object({
      id: z.number(),
      username: z.string(),
      email: z.string().optional(),
    })
    .optional()
    .nullable(),
  status: z.enum(["draft", "published"]).optional(),
  is_published: z.boolean().optional(),
  published_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  categories: z.array(AdminCategorySchema).optional(),
  tags: z.array(AdminTagSchema).optional(),
  county: z.object({ id: z.number(), name: z.string() }).optional().nullable(),
  related_posts: z.lazy(() => z.array(PostSchema)).optional(),
})

export const PostsArraySchema = z.array(PostSchema)

export type Post = z.infer<typeof PostSchema>
