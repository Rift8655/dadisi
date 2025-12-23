"use client"

import { create } from "zustand"
import { notificationsApi, AppNotification } from "@/lib/api"

interface NotificationState {
  notifications: AppNotification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  currentPage: number
  lastPage: number
  total: number
  
  // Actions
  fetchNotifications: (params?: { unread_only?: boolean; page?: number }) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  clearAll: () => Promise<void>
  reset: () => void
}

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  currentPage: 1,
  lastPage: 1,
  total: 0,
}

export const useNotifications = create<NotificationState>((set, get) => ({
  ...initialState,

  fetchNotifications: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const response = await notificationsApi.list({
        ...params,
        per_page: 20,
      })
      
      set({
        notifications: response.data.data,
        unreadCount: response.unread_count,
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch notifications",
        isLoading: false,
      })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationsApi.unreadCount()
      set({ unreadCount: response.data.unread_count })
    } catch (error) {
      console.error("Failed to fetch unread count:", error)
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      
      const { notifications, unreadCount } = get()
      const notification = notifications.find((n) => n.id === id)
      
      set({
        notifications: notifications.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        ),
        unreadCount: notification && !notification.read_at ? unreadCount - 1 : unreadCount,
      })
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead()
      
      const { notifications } = get()
      set({
        notifications: notifications.map((n) => ({
          ...n,
          read_at: n.read_at || new Date().toISOString(),
        })),
        unreadCount: 0,
      })
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await notificationsApi.delete(id)
      
      const { notifications, unreadCount } = get()
      const notification = notifications.find((n) => n.id === id)
      
      set({
        notifications: notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.read_at ? unreadCount - 1 : unreadCount,
        total: get().total - 1,
      })
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  },

  clearAll: async () => {
    try {
      await notificationsApi.clearAll()
      set({ notifications: [], unreadCount: 0, total: 0 })
    } catch (error) {
      console.error("Failed to clear all notifications:", error)
    }
  },

  reset: () => set(initialState),
}))
