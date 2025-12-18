"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useAuth } from "@/store/auth"
import { ArrowLeft, Plus, RotateCcw, Trash2, Zap, X } from "lucide-react"
import Swal from "sweetalert2"

import { AdminRole, AdminUser } from "@/types/admin"
import { useAdmin } from "@/store/admin"
import { canManageUser } from "@/lib/rbac"
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
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog"
import { RoleSelector } from "@/components/admin/role-selector"
import { Unauthorized } from "@/components/unauthorized"

export default function UserDetailPage() {
  const params = useParams()
  const userId = parseInt(params.id as string)
  const currentUser = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)

  const [user, setUser] = useState<AdminUser | null>(null)
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [selectedRoles, setSelectedRoles] = useState<AdminRole[]>([])
  const [editData, setEditData] = useState({ username: "", email: "" })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [authorizationError, setAuthorizationError] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: "delete" | "restore" | "forceDelete" | null
  }>({
    open: false,
    action: null,
  })
  const [showAddRole, setShowAddRole] = useState(false)
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState<string>("")
  const [roleOperationLoading, setRoleOperationLoading] = useState<{
    role: string
    operation: "add" | "remove"
  } | null>(null)

  const loadUserAction = useAdmin((s) => s.loadUser)
  const loadRolesAction = useAdmin((s) => s.loadRoles)

  const loadUser = async () => {
    try {
      setLoading(true)
      const userData = await loadUserAction(userId)
      setUser(userData)
      setEditData({ username: userData.username || "", email: userData.email })
      setSelectedRoles(userData.roles || [])
    } catch (error) {
      const status = (error as any).status

      if (status === 403) {
        setAuthorizationError(true)
      } else if (status === 401) {
        logout()
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load user"
        Swal.fire({ icon: "error", title: "Error", text: errorMessage })
      }
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      await loadRolesAction()
      const rolesFromStore = useAdmin.getState().roles
      setRoles(rolesFromStore || [])
    } catch (error) {
      console.error("Failed to load roles:", error)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      await useAdmin.getState().updateUser(user.id, {
        username: editData.username,
        email: editData.email,
      })

      const roleNames = selectedRoles.map((r) => r.name)
      await useAdmin.getState().syncUserRoles(user.id, roleNames)

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "User updated successfully",
        timer: 1500,
      })

      setIsEditing(false)
      await loadUser()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update user"
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAction = async () => {
    if (!user) return

    try {
      await useAdmin.getState().deleteUser(user.id)
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "User deleted successfully",
        timer: 1500,
      })
      window.location.href = "/admin/users"
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete user"
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      })
    }
  }

  const handleRestoreAction = async () => {
    if (!user) return

    try {
      await useAdmin.getState().restoreUser(user.id)
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "User restored successfully",
        timer: 1500,
      })
      await loadUser()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to restore user"
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      })
    }
  }

  const handleForceDeleteAction = async () => {
    if (!user) return

    try {
      await useAdmin.getState().forceDeleteUser(user.id)
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "User permanently deleted successfully",
        timer: 1500,
      })
      window.location.href = "/admin/users"
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to permanently delete user"
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      })
    }
  }

  const handleAssignRole = async () => {
    if (!user || !selectedRoleToAdd) return

    setRoleOperationLoading({ role: selectedRoleToAdd, operation: "add" })

    try {
      await useAdmin.getState().assignUserRole(user.id, selectedRoleToAdd)
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: `Role '${selectedRoleToAdd}' assigned successfully`,
        timer: 1500,
      })

      setSelectedRoleToAdd("")
      setShowAddRole(false)
      await loadUser()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to assign role"
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      })
    } finally {
      setRoleOperationLoading(null)
    }
  }

  const handleRemoveRole = async (roleName: string) => {
    if (!user) return

    setRoleOperationLoading({ role: roleName, operation: "remove" })

    try {
      await useAdmin.getState().removeUserRole(user.id, roleName)
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: `Role '${roleName}' removed successfully`,
        timer: 1500,
      })

      await loadUser()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove role"
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      })
    } finally {
      setRoleOperationLoading(null)
    }
  }

  useEffect(() => {
    loadUser()
    loadRoles()
  }, [userId])

  if (authorizationError) {
    return <Unauthorized actionHref="/admin/users" />
  }

  if (loading) {
    return (
      <AdminDashboardShell title="User Detail">
        <div className="p-4 text-center">Loading...</div>
      </AdminDashboardShell>
    )
  }

  if (!user) {
    return (
      <AdminDashboardShell title="User Detail">
        <div className="p-4 text-center text-gray-500">User not found</div>
      </AdminDashboardShell>
    )
  }

  const isDeleted = !!user.deleted_at

  return (
    <AdminDashboardShell title={user.name || user.username}>
      <div className="space-y-4">
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{user.name || user.username}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
              <div>
                {isDeleted ? (
                  <span className="inline-block rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900 dark:text-red-100">
                    Deleted
                  </span>
                ) : (
                  <span className="inline-block rounded bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                    Active
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Username
                  </label>
                  <Input
                    value={editData.username}
                    onChange={(e) =>
                      setEditData({ ...editData, username: e.target.value })
                    }
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Assign Roles
                  </label>
                  <RoleSelector
                    roles={roles}
                    selectedRoles={selectedRoles}
                    onSelectionChange={setSelectedRoles}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setEditData({
                        username: user.username || "",
                        email: user.email,
                      })
                      setSelectedRoles(user.roles || [])
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Username
                  </p>
                  <p className="text-lg font-medium">{user.username}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Email
                  </p>
                  <p className="text-lg font-medium">{user.email}</p>
                </div>

                {user.email_verified_at && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Email Verified
                    </p>
                    <p className="text-lg font-medium">Yes</p>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                    Roles
                  </p>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <div
                            key={role.id}
                            className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                          >
                            <span>{role.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-3 w-3 p-0 hover:bg-purple-200"
                              onClick={() => handleRemoveRole(role.name)}
                              disabled={
                                roleOperationLoading?.role === role.name &&
                                roleOperationLoading.operation === "remove"
                              }
                            >
                              <X className="h-2 w-2" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">
                          No roles assigned
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {!showAddRole ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAddRole(true)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add Role
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <select
                            value={selectedRoleToAdd}
                            onChange={(e) => setSelectedRoleToAdd(e.target.value)}
                            className="rounded border px-2 py-1 text-sm"
                            disabled={roleOperationLoading?.operation === "add"}
                          >
                            <option value="">Select a role...</option>
                            {roles
                              .filter(
                                (role) =>
                                  !user.roles?.some((ur) => ur.name === role.name)
                              )
                              .map((role) => (
                                <option key={role.id} value={role.name}>
                                  {role.name}
                                </option>
                              ))}
                          </select>
                          <Button
                            size="sm"
                            onClick={handleAssignRole}
                            disabled={
                              !selectedRoleToAdd ||
                              roleOperationLoading?.operation === "add"
                            }
                          >
                            Add
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowAddRole(false)
                              setSelectedRoleToAdd("")
                            }}
                            disabled={roleOperationLoading?.operation === "add"}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={() => setIsEditing(true)}>Edit User</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {user.member_profile && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {user.member_profile.first_name && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      First Name
                    </p>
                    <p className="font-medium">{user.member_profile.first_name}</p>
                  </div>
                )}
                {user.member_profile.last_name && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Last Name
                    </p>
                    <p className="font-medium">{user.member_profile.last_name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!isDeleted ? (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() =>
                  setConfirmDialog({ open: true, action: "delete" })
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setConfirmDialog({ open: true, action: "restore" })
                  }
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore User
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() =>
                    setConfirmDialog({ open: true, action: "forceDelete" })
                  }
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Permanently Delete User
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        open={confirmDialog.open}
        title={
          confirmDialog.action === "delete"
            ? "Delete User"
            : confirmDialog.action === "restore"
              ? "Restore User"
              : "Permanently Delete User"
        }
        description={
          confirmDialog.action === "delete"
            ? `Are you sure you want to delete ${user.name || user.username}? They will be able to request restoration.`
            : confirmDialog.action === "restore"
              ? `Are you sure you want to restore ${user.name || user.username}?`
              : `Are you sure you want to permanently delete ${user.name || user.username}? This action cannot be undone.`
        }
        actionLabel={
          confirmDialog.action === "delete"
            ? "Delete"
            : confirmDialog.action === "restore"
              ? "Restore"
              : "Permanently Delete"
        }
        variant={
          confirmDialog.action === "forceDelete" ? "destructive" : "default"
        }
        onConfirm={() => {
          confirmDialog.action === "delete"
            ? handleDeleteAction()
            : confirmDialog.action === "restore"
              ? handleRestoreAction()
              : handleForceDeleteAction()
        }}
        onCancel={() => setConfirmDialog({ open: false, action: null })}
      />
    </AdminDashboardShell>
  )
}
