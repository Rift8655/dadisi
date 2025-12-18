"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useAuth } from "@/store/auth"
import { ArrowLeft } from "lucide-react"
import Swal from "sweetalert2"

import {
  AdminPermission,
  AdminRole,
  AdminUser,
  PaginatedResponse,
} from "@/types/admin"
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
import { RolePermissionTree } from "@/components/admin/role-permission-tree"
import { Unauthorized } from "@/components/unauthorized"

export default function RoleDetailPage() {
  const params = useParams()
  const roleId = parseInt(params.id as string)
  const currentUser = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)

  const [role, setRole] = useState<AdminRole | null>(null)
  const [allPermissions, setAllPermissions] = useState<AdminPermission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<
    AdminPermission[]
  >([])
  const [editData, setEditData] = useState({ name: "" })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [authorizationError, setAuthorizationError] = useState(false)

  const loadRoleAction = useAdmin((s) => s.loadRole)
  const loadPermissionsAction = useAdmin((s) => s.loadPermissions)

  const loadRole = async () => {
    try {
      setLoading(true)
      const roleData = await loadRoleAction(roleId)
      setRole(roleData)
      setEditData({ name: roleData.name })
      setSelectedPermissions(roleData.permissions || [])
    } catch (error) {
      const status = (error as any).status

      if (status === 403) {
        setAuthorizationError(true)
      } else if (status === 401) {
        logout()
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to load role"
        Swal.fire({ icon: "error", title: "Error", text: errorMessage })
      }
    } finally {
      setLoading(false)
    }
  }

  const loadPermissions = async () => {
    try {
      const perms = await loadPermissionsAction()
      setAllPermissions(perms)
    } catch (error) {
      console.error("Failed to load permissions:", error)
    }
  }

  const handleSave = async () => {
    if (!role) return

    setIsSaving(true)
    try {
      if (editData.name !== role.name) {
        await useAdmin.getState().updateRole(role.id, { name: editData.name })
      }

      const permissionNames = selectedPermissions.map((p) => p.name)
      await useAdmin.getState().assignRolePermissions(role.id, permissionNames)

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Role updated successfully",
        timer: 1500,
      })

      setIsEditing(false)
      await loadRole()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update role"
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      })
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    loadRole()
    loadPermissions()
  }, [roleId])

  if (authorizationError) {
    return <Unauthorized actionHref="/admin/roles" />
  }

  if (loading) {
    return (
      <AdminDashboardShell title="Role Detail">
        <div className="p-4 text-center">Loading...</div>
      </AdminDashboardShell>
    )
  }

  if (!role) {
    return (
      <AdminDashboardShell title="Role Detail">
        <div className="p-4 text-center text-gray-500">Role not found</div>
      </AdminDashboardShell>
    )
  }

  const isBuiltIn = isBuiltInRole(role.name)

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
                <span className="inline-block rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  Built-in
                </span>
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
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Role Name
                  </label>
                  <Input
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    disabled={isSaving}
                  />
                </div>
              </>
            ) : (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Role Name
                </p>
                <p className="text-lg font-medium capitalize">
                  {role.name.replace(/_/g, " ")}
                </p>
              </div>
            )}

            {isEditing && !isBuiltIn && (
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
            )}

            {!isEditing && !isBuiltIn && (
              <Button onClick={() => setIsEditing(true)}>Edit Role Name</Button>
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

            <div className="mt-4 flex justify-end gap-2">
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
                    {isSaving ? "Saving..." : "Save Changes"}
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

        {role.users_count && role.users_count > 0 && (
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
                className="mt-2 inline-block"
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
