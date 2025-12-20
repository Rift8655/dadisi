/**
 * Real-time chat hook using Laravel Echo + Pusher
 * Listens for new messages on the user's private channel
 */

import { useEffect, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/store/auth"
import Pusher from "pusher-js"
import Echo from "laravel-echo"

// Extend window with Echo instance
declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo: Echo
  }
}

// Initialize Echo only once
let echoInstance: Echo | null = null

function getEcho(): Echo | null {
  if (typeof window === "undefined") return null

  if (!echoInstance) {
    // Check for required env vars
    const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY
    const cluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || "ap2"

    if (!key) {
      console.warn("[Echo] PUSHER_APP_KEY not configured, real-time disabled")
      return null
    }

    window.Pusher = Pusher

    // Get auth token from localStorage
    let authToken = ""
    try {
      const authStorage = localStorage.getItem("auth-storage")
      if (authStorage) {
        const parsed = JSON.parse(authStorage)
        authToken = parsed.state?.token || ""
      }
    } catch (e) {
      console.warn("[Echo] Failed to get auth token")
    }

    echoInstance = new Echo({
      broadcaster: "pusher",
      key,
      cluster,
      forceTLS: true,
      authEndpoint: `${process.env.NEXT_PUBLIC_BACKEND_APP_URL || "http://localhost:8000"}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    })
  }

  return echoInstance
}

// Disconnect and reconnect with new auth
export function reconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
  }
  return getEcho()
}

export interface MessageSentPayload {
  id: string
  sender_id: number
  sender_username: string
  r2_object_key: string
  encrypted_key_package: string
  nonce: string
  created_at: string
}

interface UseRealtimeChatOptions {
  onMessage?: (payload: MessageSentPayload) => void
}

export function useRealtimeChat(options: UseRealtimeChatOptions = {}) {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const handleNewMessage = useCallback(
    (payload: MessageSentPayload) => {
      // Invalidate queries to refresh conversation list
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
      queryClient.invalidateQueries({ queryKey: ["messages", payload.sender_id] })

      // Call custom handler if provided
      options.onMessage?.(payload)
    },
    [queryClient, options]
  )

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    const echo = getEcho()
    if (!echo) return

    // Subscribe to private chat channel
    const channelName = `chat.${user.id}`
    const channel = echo.private(channelName)

    channel.listen(".message.sent", handleNewMessage)

    return () => {
      channel.stopListening(".message.sent")
      echo.leave(`private-${channelName}`)
    }
  }, [isAuthenticated, user?.id, handleNewMessage])

  return {
    isConnected: !!echoInstance,
  }
}
