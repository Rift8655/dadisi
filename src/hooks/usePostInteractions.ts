"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { postsApi } from "@/lib/api"

// ==================== COMMENTS HOOKS ====================

export function usePostComments(slug: string) {
  return useQuery({
    queryKey: ["post-comments", slug],
    queryFn: () => postsApi.getComments(slug),
    enabled: !!slug,
  })
}

export function useCreateComment(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ body, parentId }: { body: string; parentId?: number }) =>
      postsApi.createComment(slug, body, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", slug] })
      toast.success("Comment added successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add comment")
    },
  })
}

export function useDeleteComment(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) => postsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", slug] })
      toast.success("Comment deleted")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete comment")
    },
  })
}

// ==================== LIKES HOOKS ====================

export function usePostLikeStatus(slug: string, enabled = true) {
  return useQuery({
    queryKey: ["post-like-status", slug],
    queryFn: () => postsApi.getLikeStatus(slug),
    enabled: enabled && !!slug,
  })
}

export function useToggleLike(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (type: "like" | "dislike") => postsApi.toggleLike(slug, type),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["post-like-status", slug] })
      // Also invalidate any post queries to update counts
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["post", slug] })

      if (data.action === "added") {
        toast.success(data.message)
      } else if (data.action === "removed") {
        toast.info(data.message)
      } else if (data.action === "switched") {
        toast.info(data.message)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update vote")
    },
  })
}

export function usePostLikers(slug: string) {
  return useQuery({
    queryKey: ["post-likers", slug],
    queryFn: () => postsApi.getLikers(slug),
    enabled: !!slug,
  })
}
