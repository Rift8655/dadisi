import { useQuery } from "@tanstack/react-query"
import { postsApi } from "@/lib/api"
import { PostsArraySchema, PostSchema, Post } from "@/schemas/post"

export function usePosts(params?: { page?: number; tag?: string; search?: string }) {
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
