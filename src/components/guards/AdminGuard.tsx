"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/store/auth"
import { Loader2 } from "lucide-react"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user)
  const isLoading = useAuth((s) => s.isLoading)
  const _hasHydrated = useAuth((s) => s._hasHydrated)
  const router = useRouter()
  const [forceHydrated, setForceHydrated] = useState(false)

  // Failsafe: If hydration doesn't complete within 2 seconds, force it
  useEffect(() => {
    if (_hasHydrated) return

    const timeout = setTimeout(() => {
      console.warn("[AdminGuard] Hydration timeout, forcing hydrated state")
      setForceHydrated(true)
      useAuth.setState({ _hasHydrated: true })
    }, 2000)

    return () => clearTimeout(timeout)
  }, [_hasHydrated])

  const isHydrated = _hasHydrated || forceHydrated

  useEffect(() => {
    if (
      isHydrated &&
      !isLoading &&
      (!user || !user.ui_permissions.can_access_admin_panel)
    ) {
      router.push("/dashboard")
    }
  }, [user, isLoading, isHydrated, router])

  if (!isHydrated || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If not loading and not authorized, effect will redirect.
  // We return null or fallback during the tick.
  if (!user || !user.ui_permissions.can_access_admin_panel) {
    return null
  }

  return <>{children}</>
}
