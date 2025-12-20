import { z } from "zod"

// Base Forum Category Schema (without children to avoid recursive type issues)
const ForumCategoryBaseSchema = z.object({
  id: z.number(),
  parent_id: z.number().nullable(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  order: z.number(),
  is_active: z.boolean(),
  threads_count: z.number().optional(),
})

// Forum Thread Schema (Defined early so it can be used in Category)
export const ForumThreadSchema = z.object({
  id: z.number(),
  category_id: z.number(),
  user_id: z.number(),
  county_id: z.number().nullable().optional(),
  title: z.string(),
  slug: z.string(),
  content: z.string().optional(),
  is_pinned: z.boolean(),
  is_locked: z.boolean(),
  views_count: z.number().optional(),
  posts_count: z.number().optional(),
  reply_count: z.number().optional(),
  view_count: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    profile_picture_path: z.string().nullable().optional(),
  }).optional(),
  county: z.object({
    id: z.number(),
    name: z.string(),
  }).nullable().optional(),
  category: ForumCategoryBaseSchema.optional(),
})

// Forum Category Schema with optional children and threads
export const ForumCategorySchema = ForumCategoryBaseSchema.extend({
  children: z.array(ForumCategoryBaseSchema).optional(),
  threads: z.array(ForumThreadSchema).optional(),
})

export const ForumCategoriesSchema = z.array(ForumCategorySchema)

export const ForumThreadsSchema = z.array(ForumThreadSchema)

// Forum Post Schema
export const ForumPostSchema = z.object({
  id: z.number(),
  thread_id: z.number(),
  user_id: z.number(),
  parent_id: z.number().nullable().optional(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  is_edited: z.boolean().optional(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    profile_picture_path: z.string().nullable().optional(),
  }).optional(),
})

export const ForumPostsSchema = z.array(ForumPostSchema)

// Group Schema (for county hubs)
export const GroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  county_id: z.number().nullable(),
  county: z.object({
    id: z.number(),
    name: z.string(),
  }).nullable().optional(),
  image_path: z.string().nullable(),
  member_count: z.number(),
  is_private: z.boolean().optional(),
  is_active: z.boolean().optional(),
  is_member: z.boolean().optional(),
})

export const GroupsSchema = z.array(GroupSchema)

// Inferred Types
export type ForumCategory = z.infer<typeof ForumCategorySchema>
export type ForumThread = z.infer<typeof ForumThreadSchema>
export type ForumPost = z.infer<typeof ForumPostSchema>
export type Group = z.infer<typeof GroupSchema>
