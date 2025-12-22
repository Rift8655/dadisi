"use client"

import { useState } from "react"
import { useAuth } from "@/store/auth"

import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Unauthorized } from "@/components/unauthorized"

export default function AdminEventsPage() {
  const user = useAuth((s) => s.user)
  const isLoading = useAuth((s) => s.isLoading)
  const logout = useAuth((s) => s.logout)
  const [authorizationError, setAuthorizationError] = useState(false)

  if (isLoading || !user) {
    return (
      <AdminDashboardShell title="Event Management">
        <div className="flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Loading user...</p>
        </div>
      </AdminDashboardShell>
    )
  }

  if (authorizationError) {
    return <Unauthorized actionHref="/admin" />
  }

  return (
    <AdminDashboardShell title="Event Management">
      <div className="p-2">
        Event management placeholder. Manage events, RSVPs and capacity here.
      </div>
    </AdminDashboardShell>
  )
}
