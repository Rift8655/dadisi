"use client"

import { useState } from "react"
import { useAuth } from "@/store/auth"

import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Unauthorized } from "@/components/unauthorized"

export default function AdminAnalyticsPage() {
  const user = useAuth((s) => s.user)
  const isLoading = useAuth((s) => s.isLoading)
  const logout = useAuth((s) => s.logout)
  const [authorizationError, setAuthorizationError] = useState(false)

  if (isLoading || !user) {
    return (
      <AdminDashboardShell title="Analytics">
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
    <AdminDashboardShell title="Analytics">
      <div className="p-2">
        Analytics dashboard placeholder. Display system statistics, user
        activity, donations, and event analytics here.
      </div>
    </AdminDashboardShell>
  )
}
