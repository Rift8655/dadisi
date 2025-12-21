"use client"

import { useEffect, useCallback } from "react"
import { useAuth } from "@/store/auth"

/**
 * Periodically checks if the session token is expiring and refreshes it silently.
 * This runs in the background for authenticated users.
 */
export function SessionRefresher() {
  const { isAuthenticated, isTokenExpiringSoon, refreshSession } = useAuth()

  const checkAndRefresh = useCallback(async () => {
    if (!isAuthenticated) return

    // If token expires in less than 30 minutes, refresh it
    if (isTokenExpiringSoon(30)) {
      console.log("[Auth] Token expiring soon, performing silent refresh...")
      await refreshSession()
    }
  }, [isAuthenticated, isTokenExpiringSoon, refreshSession])

  useEffect(() => {
    if (!isAuthenticated) return

    // Perform initial check on mount/auth change
    checkAndRefresh()

    // Check every 5 minutes
    const intervalId = setInterval(checkAndRefresh, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [isAuthenticated, checkAndRefresh])

  return null // This component doesn't render anything
}
