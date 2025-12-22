"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/store/auth"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import Swal from "sweetalert2"

import {
  AdminPermission,
  AdminRole,
} from "@/types/admin"
import {
  useRole,
  usePermissions,
  useUpdateRole,
  useAssignRolePermissions,
} from "@/hooks/useRoles"
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
import { RolePermissionTree } from "@/components/admin/role-permission-tree"
import { Unauthorized } from "@/components/unauthorized"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export default function RoleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roleId = parseInt(params.id as string)
  const logout = useAuth((s) => s.logout)

  const { data: role, isLoading: loading, error: roleError } = useRole(roleId)
  const { data: permissionsResponse, isLoading: loadingPermissions } = usePermissions({ per_page: 500 })
  const allPermissions = Array.isArray(permissionsResponse) ? permissionsResponse : permissionsResponse?.data || []

  const updateMutation = useUpdateRole()
  const assignPermissionsMutation = useAssignRolePermissions()

  const [selectedPermissions, setSelectedPermissions] = useState<AdminPermission[]>([])
  const [editData, setEditData] = useState({ name: "" })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (role) {
      setEditData({ name: role.name })
      setSelectedPermissions(role.permissions || [])
    }
  }, [role])

  const handleSave = async () => {
    if (!role) return

    try {
      if (editData.name !== role.name) {
        await updateMutation.mutateAsync({ id: role.id, payload: { name: editData.name } })
      }

      const permissionNames = selectedPermissions.map((p) => p.name)
      await assignPermissionsMutation.mutateAsync({ id: role.id, permissionNames })

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Role updated successfully",
        timer: 1500,
        showConfirmButton: false,
      })

      setIsEditing(false)
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update role",
      })
    }
  }

  if (roleError) {
    const status = (roleError as any).status
    if (status === 403) return <Unauthorized actionHref="/admin/roles" />
    if (status === 401) {
      logout()
      return null
    }
    return (
      <AdminDashboardShell title="Error">
        <div className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium">Failed to load role</p>
          <p className="text-muted-foreground">{roleError.message}</p>
        </div>
      </AdminDashboardShell>
    )
  }

  if (loading) {
    return (
      <AdminDashboardShell title="Role Detail">
        <div className="space-y-4 p-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminDashboardShell>
    )
  }

  if (!role) {
    return (
      <AdminDashboardShell title="Role Detail">
        <div className="p-8 text-center text-gray-500">Role not found</div>
      </AdminDashboardShell>
    )
  }

  const isBuiltIn = isBuiltInRole(role.name)
  const isSaving = updateMutation.isPending || assignPermissionsMutation.isPending

  return (
    <AdminDashboardShell title={role.name}>
      <div className="space-y-4">
        <Link href="/admin/roles">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Roles
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{role.name}</CardTitle>
                <CardDescription>
                  {isBuiltIn ? "Built-in role" : "Custom role"}
                </CardDescription>
              </div>
              {isBuiltIn && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                  Built-in
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing && !isBuiltIn ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Role Name</label>
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  disabled={isSaving}
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setEditData({ name: role.name })
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Role Name</p>
                <p className="text-lg font-medium capitalize">
                  {role.name.replace(/_/g, " ")}
                </p>
                {!isBuiltIn && (
                   <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsEditing(true)}>
                    Edit Name
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>
              Select which permissions this role should have
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RolePermissionTree
              availablePermissions={allPermissions}
              selectedPermissions={selectedPermissions}
              onSelectionChange={setSelectedPermissions}
              disabled={isSaving}
            />

            <div className="mt-6 flex justify-end gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setSelectedPermissions(role.permissions || [])
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Permissions
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {role.users_count !== undefined && role.users_count > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Users with this role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This role is assigned to {role.users_count} user
                {role.users_count !== 1 ? "s" : ""}.
              </p>
              <Link
                href={`/admin/users?role=${role.name}`}
                className="mt-4 inline-block"
              >
                <Button variant="outline" size="sm">
                  View Users
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminDashboardShell>
  )
}
