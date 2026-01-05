"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/store/auth"
import { Loader2 } from "lucide-react"

/**
 * AuthGuard - Protects routes that require authentication.
 * Redirects to login with a return URL if the user is not authenticated.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user)
  const isLoading = useAuth((s) => s.isLoading)
  const _hasHydrated = useAuth((s) => s._hasHydrated)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only redirect if hydration is complete, not loading, and no user found
    if (_hasHydrated && !isLoading && !user) {
      const returnUrl = encodeURIComponent(pathname)
      router.push(`/login?redirect=${returnUrl}`)
    }
  }, [user, isLoading, _hasHydrated, router, pathname])

  if (!_hasHydrated || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
