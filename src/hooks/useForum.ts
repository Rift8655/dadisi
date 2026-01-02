import {
  ForumCategoriesSchema,
  ForumCategorySchema,
  ForumPostsSchema,
  ForumThreadSchema,
  ForumThreadsSchema,
  type ForumCategory,
  type ForumPost,
  type ForumThread,
} from "@/schemas/forum"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { forumApi } from "@/lib/api"

// Caching Strategy:
// - Categories: Tier 2 (Stable Metadata) - 1 hour staleTime
// - Threads: Tier 3 (Standard) - 5 minutes staleTime
// - Posts: Tier 3 (Standard) - 5 minutes staleTime

const ONE_HOUR = 1000 * 60 * 60
const FIVE_MINUTES = 1000 * 60 * 5

// ============================================================================
// CATEGORY HOOKS
// ============================================================================

/**
 * Fetch all forum categories with subcategories
 * Tier 2: Stable metadata - 1 hour staleTime
 */
export function useForumCategories() {
  return useQuery({
    queryKey: ["forum-categories"],
    queryFn: async () => {
      const response = await forumApi.categories.list()
      // Validate with Zod
      const validated = ForumCategoriesSchema.safeParse(response.data)
      if (!validated.success) {
        console.error(
          "Forum categories validation failed:",
          validated.error.format()
        )
        return response.data as unknown as ForumCategory[]
      }
      return validated.data
    },
    staleTime: ONE_HOUR,
  })
}

/**
 * Fetch a single forum category with its threads
 * Tier 3: Standard - 5 minutes staleTime
 */
export function useForumCategory(slug: string) {
  return useQuery({
    queryKey: ["forum-category", slug],
    queryFn: async () => {
      const response = await forumApi.categories.get(slug)
      return response.data
    },
    enabled: !!slug,
    staleTime: FIVE_MINUTES,
  })
}

// ============================================================================
// THREAD HOOKS
// ============================================================================

/**
 * Fetch a single thread by slug
 * Tier 3: Standard - 5 minutes staleTime
 */
export function useForumThread(slug: string) {
  return useQuery({
    queryKey: ["forum-thread", slug],
    queryFn: async () => {
      const response = await forumApi.threads.get(slug)
      // Backend returns { success, data: { thread, posts } } - handle both formats
      const threadData =
        (response as any).data?.thread || (response as any).thread
      if (!threadData) {
        throw new Error("Thread not found")
      }
      const validated = ForumThreadSchema.safeParse(threadData)
      if (!validated.success) {
        // Log issues but don't fail - just use raw data
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Forum thread schema mismatch (using raw data):",
            validated.error.issues
          )
        }
        return threadData as ForumThread
      }
      return validated.data
    },
    enabled: !!slug,
    staleTime: FIVE_MINUTES,
  })
}

/**
 * Create a new thread in a category
 */
export function useCreateThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      categorySlug,
      data,
    }: {
      categorySlug: string
      data: { title: string; content: string; county_id?: number }
    }) => forumApi.threads.create(categorySlug, data),
    onSuccess: (_, variables) => {
      // Invalidate category to refresh thread list
      queryClient.invalidateQueries({
        queryKey: ["forum-category", variables.categorySlug],
      })
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] })
    },
  })
}

/**
 * Update a thread
 */
export function useUpdateThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      slug,
      data,
    }: {
      slug: string
      data: { title?: string; content?: string }
    }) => forumApi.threads.update(slug, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["forum-thread", variables.slug],
      })
    },
  })
}

/**
 * Delete a thread
 */
export function useDeleteThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => forumApi.threads.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] })
    },
  })
}

/**
 * Thread moderation actions
 */
export function usePinThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => forumApi.threads.pin(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ["forum-thread", slug] })
    },
  })
}

export function useUnpinThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => forumApi.threads.unpin(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ["forum-thread", slug] })
    },
  })
}

export function useLockThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => forumApi.threads.lock(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ["forum-thread", slug] })
    },
  })
}

export function useUnlockThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => forumApi.threads.unlock(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ["forum-thread", slug] })
    },
  })
}

// ============================================================================
// POST HOOKS
// ============================================================================

/**
 * Fetch posts for a thread
 * Tier 3: Standard - 5 minutes staleTime
 */
export function useForumPosts(threadSlug: string, params?: { page?: number }) {
  return useQuery({
    queryKey: ["forum-posts", threadSlug, params],
    queryFn: async () => {
      const response = await forumApi.posts.list(threadSlug, params)
      // Backend returns paginated data, so we need to extract the posts array
      const postsArray = (response as any)?.data?.data || response.data || []
      const validated = ForumPostsSchema.safeParse(postsArray)
      if (!validated.success) {
        console.error(
          "Forum posts validation failed:",
          validated.error.format()
        )
        return {
          data: postsArray as ForumPost[],
          meta: {
            total: (response as any)?.data?.total,
            per_page: (response as any)?.data?.per_page,
            current_page: (response as any)?.data?.current_page,
            last_page: (response as any)?.data?.last_page,
          },
        }
      }
      return {
        data: validated.data,
        meta: {
          total: (response as any)?.data?.total,
          per_page: (response as any)?.data?.per_page,
          current_page: (response as any)?.data?.current_page,
          last_page: (response as any)?.data?.last_page,
        },
      }
    },
    enabled: !!threadSlug,
    staleTime: FIVE_MINUTES,
  })
}

/**
 * Create a new post (reply)
 */
export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      threadSlug,
      data,
    }: {
      threadSlug: string
      data: { content: string; parent_id?: number }
    }) => forumApi.posts.create(threadSlug, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["forum-posts", variables.threadSlug],
      })
      queryClient.invalidateQueries({
        queryKey: ["forum-thread", variables.threadSlug],
      })
    },
  })
}

/**
 * Update a post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { content: string } }) =>
      forumApi.posts.update(id, data),
    onSuccess: () => {
      // Invalidate all forum posts queries
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] })
    },
  })
}

/**
 * Delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => forumApi.posts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] })
    },
  })
}
