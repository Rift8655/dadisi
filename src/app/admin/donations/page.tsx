"use client"

import { useState } from "react"
import { useAuth } from "@/store/auth"

import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Unauthorized } from "@/components/unauthorized"

export default function AdminDonationsPage() {
  const user = useAuth((s) => s.user)
  const isLoading = useAuth((s) => s.isLoading)
  const logout = useAuth((s) => s.logout)
  const [authorizationError, setAuthorizationError] = useState(false)

  if (isLoading || !user) {
    return (
      <AdminDashboardShell title="Donations Management">
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
    <AdminDashboardShell title="Donations Management">
      <div className="p-2">
        Donations management placeholder. Link to donations reports and
        processing.
      </div>
    </AdminDashboardShell>
  )
}
