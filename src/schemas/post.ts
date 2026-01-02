import { z } from "zod"

export interface Category {
  id: number
  name: string
  slug: string
}

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
})

export interface Tag {
  id: number
  name: string
  slug: string
}

export const TagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
})

export interface Post {
  id: number
  user_id?: number
  county_id?: number | null
  title: string
  slug: string
  excerpt?: string | null
  body?: string
  content?: string
  featured_image?: string | null
  status?: "draft" | "published" | "archived"
  views_count?: number
  comments_count?: number
  author?: {
    id: number
    username: string
    email?: string
  } | null
  is_published?: boolean
  published_at?: string | null
  created_at: string
  updated_at?: string
  categories?: Category[]
  tags?: Tag[]
  county?: { id: number; name: string } | null
  related_posts?: Post[]
}

export const PostSchema: z.ZodType<Post> = z.lazy(() => z.object({
  id: z.number(),
  user_id: z.number().optional(),
  county_id: z.number().nullable().optional(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable().optional(),
  body: z.string().optional(),
  content: z.string().optional(),
  featured_image: z.string().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  views_count: z.number().optional().default(0),
  comments_count: z.number().optional().default(0),
  author: z
    .object({
      id: z.number(),
      username: z.string(),
      email: z.string().optional(),
    })
    .optional()
    .nullable(),
  is_published: z.boolean().optional(),
  published_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  categories: z.array(CategorySchema).optional(),
  tags: z.array(TagSchema).optional(),
  county: z.object({ id: z.number(), name: z.string() }).optional().nullable(),
  related_posts: z.array(z.lazy(() => PostSchema)).optional(),
}))

export const PostsArraySchema = z.array(PostSchema)

// Public blog category with post count
export const PublicCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  post_count: z.number(),
})

export const PublicCategoriesResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(PublicCategorySchema),
})

// Public blog tag with post count
export const PublicTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  post_count: z.number(),
})

export const PublicTagsResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(PublicTagSchema),
})

// Paginated posts response
export const PaginatedPostsResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(PostSchema),
  pagination: z.object({
    total: z.number(),
    per_page: z.number(),
    current_page: z.number(),
    last_page: z.number(),
  }),
})

export type PublicCategory = z.infer<typeof PublicCategorySchema>
export type PublicTag = z.infer<typeof PublicTagSchema>
export type PaginatedPostsResponse = z.infer<typeof PaginatedPostsResponseSchema>

// Helper function to extract pagination from response
export function extractPaginationFromPosts(response: PaginatedPostsResponse) {
  return {
    ...response.pagination,
    data: response.data,
  }
}
