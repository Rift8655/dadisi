"use client"

import { useEffect, useState } from "react"
import { useAdmin } from "@/store/admin"
import { useAuth } from "@/store/auth"
import { Search } from "lucide-react"
import Swal from "sweetalert2"

import { AdminAuditLog, AdminUser, PaginatedResponse } from "@/types/admin"
// adminApi import removed; using `useAdmin` store actions instead
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { AuditLogTable } from "@/components/admin/audit-log-table"
import { Unauthorized } from "@/components/unauthorized"

export default function AuditLogsPage() {
  const currentUser = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const {
    filters,
    pagination,
    setAuditModelFilter,
    setAuditActionFilter,
    setAuditUserIdFilter,
    setAuditPagination,
  } = useAdmin()

  const logs = useAdmin((s) => s.logs)
  const loading = useAdmin((s) => s.logsLoading)
  const totalPages = useAdmin((s) => s.logsTotalPages)
  const loadAuditLogs = useAdmin((s) => s.loadAuditLogs)
  const [actionFilter, setActionFilter] = useState("")
  const [modelFilter, setModelFilter] = useState("")
  const [authorizationError, setAuthorizationError] = useState(false)

  const load = async () => {
    try {
      await loadAuditLogs()
    } catch (error) {
      const status = (error as any).status

      if (status === 403) {
        setAuthorizationError(true)
      } else if (status === 401) {
        logout()
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load audit logs"
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        })
      }
    }
  }

  useEffect(() => {
    load()
  }, [
    filters.auditUserIdFilter,
    filters.auditModelFilter,
    filters.auditActionFilter,
    pagination.auditPage,
  ])

  if (authorizationError) {
    return <Unauthorized actionHref="/admin" />
  }

  return (
    <AdminDashboardShell title="Audit Logs">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>
              View system-wide audit trails and user activities
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Model</label>
                <select
                  value={modelFilter}
                  onChange={(e) => {
                    setModelFilter(e.target.value)
                    setAuditModelFilter(e.target.value)
                  }}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-950"
                >
                  <option value="">All Models</option>
                  <option value="User">Users</option>
                  <option value="Role">Roles</option>
                  <option value="Permission">Permissions</option>
                  <option value="Event">Events</option>
                  <option value="Donation">Donations</option>
                  <option value="Post">Posts</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Action</label>
                <select
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value)
                    setAuditActionFilter(e.target.value)
                  }}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-950"
                >
                  <option value="">All Actions</option>
                  <option value="created">Created</option>
                  <option value="updated">Updated</option>
                  <option value="deleted">Deleted</option>
                  <option value="restored">Restored</option>
                  <option value="assigned">Assigned</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">User ID</label>
                <Input
                  type="number"
                  placeholder="Filter by user ID..."
                  onChange={(e) => setAuditUserIdFilter(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <AuditLogTable
              logs={logs}
              isLoading={loading}
              hasMore={pagination.auditPage < totalPages}
              onLoadMore={() => setAuditPagination(pagination.auditPage + 1)}
            />
          </CardContent>
        </Card>
      </div>
    </AdminDashboardShell>
  )
}
