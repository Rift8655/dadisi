"use client"

import Link from "next/link"
import { AlertCircle, Clock, Plus, Shield, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"

export default function AdminPage() {
  return (
    <AdminDashboardShell title="Overview">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="mt-1 text-xs text-gray-500">Manage user accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Active Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="mt-1 text-xs text-gray-500">Manage permissions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="mt-1 text-xs text-gray-500">Configure policies</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="mt-1 text-xs text-gray-500">View activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage platform users and their roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create, edit, delete, and manage user accounts. Assign roles and
                permissions.
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/users">View Users</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/admin/users/invite">
                    <Plus className="mr-2 h-4 w-4" />
                    Invite User
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Role & Permission Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Roles & Permissions
              </CardTitle>
              <CardDescription>
                Configure roles and access control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create and manage roles. Assign permissions to control access to
                features.
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/roles">View Roles</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Data Retention
              </CardTitle>
              <CardDescription>Configure data cleanup policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set retention periods for user accounts, audit logs, and other
                data types.
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/retention-settings">Configure</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Audit Logs
              </CardTitle>
              <CardDescription>
                View system activity and changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track all system changes, user actions, and administrative
                activities.
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/audit-logs">View Logs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardShell>
  )
}
