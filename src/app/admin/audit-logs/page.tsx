"use client"

import { useEffect, useState } from "react"
import { useAdminUI } from "@/store/adminUI"
import { useAuth } from "@/store/auth"
import { AlertCircle } from "lucide-react"
import { useAdminAuditLogs } from "@/hooks/useAdminAuditLogs"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { AuditLogTable } from "@/components/admin/audit-log-table"
import { Unauthorized } from "@/components/unauthorized"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AuditLogsPage() {
  const logout = useAuth((s) => s.logout)
  const {
    filters,
    pagination,
    setAuditModelFilter,
    setAuditActionFilter,
    setAuditUserIdFilter,
    setAuditPagination,
  } = useAdminUI()

  const { data: logsData, isLoading: loading, error } = useAdminAuditLogs({
    model: filters.auditModelFilter || undefined,
    user_id: filters.auditUserIdFilter ? parseInt(filters.auditUserIdFilter) : undefined,
    action: filters.auditActionFilter || undefined,
    page: pagination.auditPage,
    per_page: pagination.auditPerPage,
  })

  const logs = Array.isArray(logsData) ? logsData : logsData?.data || []
  const totalPages = Array.isArray(logsData) ? 1 : (logsData?.last_page || logsData?.meta?.last_page || 1)

  if (error) {
    const status = (error as any).status
    if (status === 403) return <Unauthorized actionHref="/admin" />
    if (status === 401) {
      logout()
      return null
    }

    return (
      <AdminDashboardShell title="Error">
        <div className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium">Failed to load audit logs</p>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </AdminDashboardShell>
    )
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Model</label>
                  <select
                    value={filters.auditModelFilter}
                    onChange={(e) => setAuditModelFilter(e.target.value)}
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
                    value={filters.auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
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
                    value={filters.auditUserIdFilter}
                    onChange={(e) => setAuditUserIdFilter(e.target.value)}
                    className="mt-1"
                  />
                </div>
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
