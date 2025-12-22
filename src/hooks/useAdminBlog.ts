import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api-admin"

export function useAdminPosts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["admin-posts", params],
    queryFn: async () => {
      return await adminApi.blog.posts.list(params)
    },
  })
}

export function useAdminPublishPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (slug: string) => {
      return await adminApi.blog.posts.publish(slug)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] })
    },
  })
}

export function useAdminUnpublishPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (slug: string) => {
      return await adminApi.blog.posts.unpublish(slug)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] })
    },
  })
}

export function useAdminDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (slug: string) => {
      return await adminApi.blog.posts.delete(slug)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] })
    },
  })
}

export function useAdminRestorePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (slug: string) => {
      return await adminApi.blog.posts.restore(slug)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] })
    },
  })
}

export function useAdminForceDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (slug: string) => {
      return await adminApi.blog.posts.forceDelete(slug)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] })
    },
  })
}
