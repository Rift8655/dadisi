import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { postsApi, authorPostsApi, authorBlogApi, PostsListParams } from "@/lib/api"
import { PostsArraySchema, PostSchema, Post } from "@/schemas/post"

export function usePosts(params?: PostsListParams) {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => postsApi.list(params),
    staleTime: 1000 * 60 * 5, // 5 mins
  })
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: () => postsApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  })
}

export function usePublicCategories() {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => postsApi.getCategories(),
    staleTime: 1000 * 60 * 10, // 10 mins - categories change less frequently
  })
}

export function usePublicTags() {
  return useQuery({
    queryKey: ["blog-tags"],
    queryFn: () => postsApi.getTags(),
    staleTime: 1000 * 60 * 10, // 10 mins - tags change less frequently
  })
}

export function useAuthorPosts(params?: { page?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ["author-posts", params],
    queryFn: () => authorPostsApi.list(params),
  })
}

export function usePublishPostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => authorPostsApi.publish(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["author-posts"] })
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}

export function useUnpublishPostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => authorPostsApi.unpublish(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["author-posts"] })
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => authorPostsApi.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["author-posts"] })
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}

export function useAuthorCategories() {
  return useQuery({
    queryKey: ["author-categories"],
    queryFn: () => authorBlogApi.categories.list(),
  })
}

export function useAuthorTags() {
  return useQuery({
    queryKey: ["author-tags"],
    queryFn: () => authorBlogApi.tags.list(),
  })
}
