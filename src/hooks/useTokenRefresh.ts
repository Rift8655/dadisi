import { useCallback, useEffect, useRef } from "react"
import { useAuth } from "@/store/auth"

import { setRefreshingToken } from "@/lib/api"

const REFRESH_INTERVAL = 30 * 60 * 1000 // 30 minutes (tokens last 7 days)

/**
 * Hook that silently refreshes the auth token before it expires.
 * Should be used in the root layout or AuthProvider.
 */
export function useTokenRefresh() {
  const isAuthenticated = useAuth((s) => s.isAuthenticated)
  const setAuth = useAuth((s) => s.setAuth)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isRefreshingRef = useRef(false)

  const refreshToken = useCallback(async () => {
    // Prevent concurrent refresh attempts
    if (isRefreshingRef.current) return
    isRefreshingRef.current = true
    setRefreshingToken(true)

    try {
      // Dynamic import to avoid circular dependency
      const { authApi } = await import("@/lib/api")
      const response = await authApi.refresh()

      if (response?.user && response?.access_token) {
        // Update auth state with new token and expiry
        const authUser =
          response.user as import("@/contracts/auth.contract").AuthUser
        setAuth(authUser, response.access_token, response.expires_at)
      }
    } catch (error: unknown) {
      const err = error as { status?: number }
      // On 401, the api.ts handler will manage logout/redirect
      // We just log here - no duplicate logout
      console.warn("[TokenRefresh] Refresh failed:", err?.status)
    } finally {
      isRefreshingRef.current = false
      setRefreshingToken(false)
    }
  }, [setAuth])

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear interval if user logs out
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Initial refresh on mount (validates current token)
    refreshToken()

    // Set up periodic refresh
    intervalRef.current = setInterval(refreshToken, REFRESH_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isAuthenticated, refreshToken])
}

export default useTokenRefresh
