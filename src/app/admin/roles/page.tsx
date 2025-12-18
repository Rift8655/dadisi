"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/store/auth"
import { ArrowLeft, Edit2, Plus, Search, Trash2 } from "lucide-react"
import Swal from "sweetalert2"

import { AdminRole, AdminUser, PaginatedResponse } from "@/types/admin"
import { useRoles, useDeleteRole } from "@/hooks/useRoles"
import { useAdmin } from "@/store/admin"
import { isBuiltInRole } from "@/lib/rbac"
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
import { Unauthorized } from "@/components/unauthorized"
import { RoleCreateDialog } from "@/components/admin/role-create-dialog"

export default function RolesPage() {
  const currentUser = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const [searchTerm, setSearchTerm] = useState("")
  const [authorizationError, setAuthorizationError] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useRoles({
    search: searchTerm || undefined,
    include_permissions: true,
  })
  
  const deleteRoleMutation = useDeleteRole()

  const roles = Array.isArray(rolesData) ? rolesData : rolesData?.data || []

  useEffect(() => {
    if (rolesError) {
      const status = (rolesError as any).status
      if (status === 403) {
        setAuthorizationError(true)
      } else if (status === 401) {
        logout()
      } else {
        const errorMessage = rolesError instanceof Error ? rolesError.message : "Failed to load roles"
        Swal.fire({ icon: "error", title: "Error", text: errorMessage })
      }
    }
  }, [rolesError, logout])

  const handleDelete = async (role: AdminRole) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Delete Role",
      text: `Are you sure you want to delete the role "${role.name}"? Users with this role will no longer have it.`,
      showCancelButton: true,
    })

    if (confirmed.isConfirmed) {
      try {
        await deleteRoleMutation.mutateAsync(role.id)
        await Swal.fire({ icon: "success", title: "Success", text: "Role deleted successfully", timer: 1500 })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete role"
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        })
      }
    }
  }


  if (authorizationError) {
    return <Unauthorized actionHref="/admin" />
  }

  return (
    <AdminDashboardShell title="Roles & Permissions">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Roles</CardTitle>
                <CardDescription>
                  Manage roles and assign permissions
                </CardDescription>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left font-medium">Name</th>
                    <th className="px-4 py-2 text-left font-medium">
                      Permissions
                    </th>
                    <th className="px-4 py-2 text-left font-medium">Users</th>
                    <th className="px-4 py-2 text-left font-medium">Type</th>
                    <th className="px-4 py-2 text-center font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roles.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="px-4 py-8 text-center text-gray-500"
                                >
                                  {rolesLoading ? "Loading roles..." : "No roles found"}
                                </td>
                              </tr>
                            ) : (
                              roles.map((role) => {
                      const isBuiltIn = isBuiltInRole(role.name)
                      return (
                        <tr
                          key={role.id}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                          <td className="px-4 py-2 font-medium capitalize">
                            {role.name.replace(/_/g, " ")}
                          </td>
                          <td className="px-4 py-2">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {role.permissions?.length || 0} permission
                              {role.permissions?.length !== 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {role.users_count || 0} user
                              {role.users_count !== 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {isBuiltIn ? (
                              <span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                                Built-in
                              </span>
                            ) : (
                              <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-900 dark:text-gray-100">
                                Custom
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <div className="flex justify-center gap-1">
                              <Link href={`/admin/roles/${role.id}`}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={rolesLoading}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </Link>
                              {!isBuiltIn && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={rolesLoading}
                                  onClick={() => handleDelete(role)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      <RoleCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </AdminDashboardShell>
  )
}
