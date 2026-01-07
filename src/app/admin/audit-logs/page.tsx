"use client"

import { useEffect, useState } from "react"
import { useAdminUI } from "@/store/adminUI"
import { useAuth } from "@/store/auth"
import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

import { useAdminAuditLogs } from "@/hooks/useAdminAuditLogs"
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
  const logout = useAuth((s) => s.logout)
  const {
    filters,
    pagination,
    setAuditModelFilter,
    setAuditActionFilter,
    setAuditUserIdFilter,
    setAuditPagination,
  } = useAdminUI()

  const page = pagination.auditPage
  const perPage = pagination.auditPerPage

  const {
    data: logsData,
    isLoading: loading,
    error,
  } = useAdminAuditLogs({
    model: filters.auditModelFilter || undefined,
    user_id: filters.auditUserIdFilter
      ? parseInt(filters.auditUserIdFilter)
      : undefined,
    action: filters.auditActionFilter || undefined,
    page: page,
    per_page: perPage,
  })

  const logs = logsData?.data || []
  const meta = logsData?.meta || { total: 0, current_page: 1, last_page: 1 }

  // Reset page to 1 when filters change
  useEffect(() => {
    if (page !== 1) {
      setAuditPagination(1)
    }
  }, [
    filters.auditModelFilter,
    filters.auditActionFilter,
    filters.auditUserIdFilter,
  ])

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
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>System Activity</CardTitle>
                <CardDescription>
                  View system-wide audit trails and user activities
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{meta.total}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Total Logs
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Model</label>
                  <select
                    value={filters.auditModelFilter}
                    onChange={(e) => setAuditModelFilter(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-950"
                  >
                    <option value="">All Models</option>
                    <option value="App\Models\User">Users</option>
                    <option value="App\Models\Role">Roles</option>
                    <option value="App\Models\Permission">Permissions</option>
                    <option value="App\Models\Event">Events</option>
                    <option value="App\Models\Donation">Donations</option>
                    <option value="App\Models\Post">Posts</option>
                    <option value="App\Models\Payment">Payments</option>
                    <option value="App\Models\Subscription">
                      Subscriptions
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Action</label>
                  <select
                    value={filters.auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-950"
                  >
                    <option value="">All Actions</option>
                    <option value="created">Created</option>
                    <option value="updated">Updated</option>
                    <option value="deleted">Deleted</option>
                    <option value="restored">Restored</option>
                    <option value="assigned">Assigned</option>
                    <option value="revoked">Revoked</option>
                    <option value="payment.initiated">Payment Initiated</option>
                    <option value="payment.completed">Payment Completed</option>
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
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Audit Trail</CardTitle>
            <div className="flex items-center gap-2">
              <span className="mr-2 text-xs text-muted-foreground">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <div className="flex items-center overflow-hidden rounded-md border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-none border-r"
                  disabled={page <= 1 || loading}
                  onClick={() => setAuditPagination(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-none"
                  disabled={page >= meta.last_page || loading}
                  onClick={() => setAuditPagination(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Fetching audit logs...</p>
              </div>
            ) : (
              <AuditLogTable logs={logs} isLoading={loading} />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardShell>
  )
}
