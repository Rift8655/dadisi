"use client"

import { useAuth } from "@/store/auth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { notificationsApi } from "@/lib/api"

/**
 * TanStack Query hook for fetching unread notification count.
 * Automatically deduplicates requests across components and pauses when window is hidden.
 */
export function useUnreadCount() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const response = await notificationsApi.unreadCount()
      return response.data.unread_count
    },
    enabled: isAuthenticated,
    refetchInterval: 60000, // Poll every 60 seconds (reduced from 30s)
    refetchIntervalInBackground: false, // Stop polling when tab is hidden
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    staleTime: 30000, // Consider data fresh for 30 seconds
  })
}

/**
 * TanStack Query hook for fetching paginated notifications.
 */
export function useNotificationsList(params?: {
  unread_only?: boolean
  per_page?: number
  page?: number
}) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ["notifications", "list", params],
    queryFn: async () => {
      const response = await notificationsApi.list(params)
      return response
    },
    enabled: isAuthenticated,
    staleTime: 30000,
  })
}

/**
 * Mutation hook for marking a notification as read.
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      // Invalidate both queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

/**
 * Mutation hook for marking all notifications as read.
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

/**
 * Mutation hook for deleting a notification.
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

/**
 * Mutation hook for clearing all notifications.
 */
export function useClearAllNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsApi.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
