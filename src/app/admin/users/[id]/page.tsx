"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/store/auth"
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
  X,
  Zap,
} from "lucide-react"
import Swal from "sweetalert2"

import { AdminRole, AdminUser } from "@/types/admin"
import { memberProfileApi } from "@/lib/api"
import { canManageUser } from "@/lib/rbac"
import { useRoles } from "@/hooks/useRoles"
import {
  useAssignUserRole,
  useDeleteUser,
  useForceDeleteUser,
  useRemoveUserRole,
  useRestoreUser,
  useSyncUserRoles,
  useUpdateUser,
  useUser,
} from "@/hooks/useUsers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog"
import { RoleSelector } from "@/components/admin/role-selector"
import { Unauthorized } from "@/components/unauthorized"

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = parseInt(params.id as string)
  const logout = useAuth((s) => s.logout)

  const { data: user, isLoading: loading, error: userError } = useUser(userId)
  const { data: rolesResponse, isLoading: loadingRoles } = useRoles({
    per_page: 100,
  })
  const roles = (
    Array.isArray(rolesResponse) ? rolesResponse : rolesResponse?.data || []
  ) as AdminRole[]

  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()
  const restoreMutation = useRestoreUser()
  const forceDeleteMutation = useForceDeleteUser()
  const syncRolesMutation = useSyncUserRoles()
  const assignRoleMutation = useAssignUserRole()
  const removeRoleMutation = useRemoveUserRole()

  const [selectedRoles, setSelectedRoles] = useState<AdminRole[]>([])
  const [editData, setEditData] = useState({ username: "", email: "" })
  const [isEditing, setIsEditing] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: "delete" | "restore" | "forceDelete" | null
  }>({
    open: false,
    action: null,
  })
  const [showAddRole, setShowAddRole] = useState(false)
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState<string>("")
  const [isStaff, setIsStaff] = useState(false)
  const [staffToggleLoading, setStaffToggleLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setEditData({ username: user.username || "", email: user.email })
      setSelectedRoles((user.roles || []) as AdminRole[])
      setIsStaff(user.member_profile?.is_staff || false)
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    try {
      await updateMutation.mutateAsync({
        id: user.id,
        data: {
          username: editData.username,
          email: editData.email,
        },
      })

      const roleNames = selectedRoles.map((r) => r.name)
      await syncRolesMutation.mutateAsync({ id: user.id, roleNames })

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "User updated successfully",
        timer: 1500,
        showConfirmButton: false,
      })

      setIsEditing(false)
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update user",
      })
    }
  }

  const handleDeleteAction = async () => {
    if (!user) return
    try {
      await deleteMutation.mutateAsync(user.id)
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "User deleted successfully",
        timer: 1500,
        showConfirmButton: false,
      })
      router.push("/admin/users")
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to delete user",
      })
    }
  }

  const handleRestoreAction = async () => {
    if (!user) return
    try {
      await restoreMutation.mutateAsync(user.id)
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "User restored successfully",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to restore user",
      })
    }
  }

  const handleForceDeleteAction = async () => {
    if (!user) return
    try {
      await forceDeleteMutation.mutateAsync(user.id)
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "User permanently deleted",
        timer: 1500,
        showConfirmButton: false,
      })
      router.push("/admin/users")
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to permanently delete user",
      })
    }
  }

  const handleAssignRole = async () => {
    if (!user || !selectedRoleToAdd) return
    try {
      await assignRoleMutation.mutateAsync({
        id: user.id,
        roleName: selectedRoleToAdd,
      })
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: `Role '${selectedRoleToAdd}' assigned`,
        timer: 1500,
        showConfirmButton: false,
      })
      setSelectedRoleToAdd("")
      setShowAddRole(false)
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to assign role",
      })
    }
  }

  const handleRemoveRole = async (roleName: string) => {
    if (!user) return
    try {
      await removeRoleMutation.mutateAsync({ id: user.id, roleName })
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: `Role '${roleName}' removed`,
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to remove role",
      })
    }
  }

  const handleStaffToggle = async (checked: boolean) => {
    if (!user?.member_profile) return

    setStaffToggleLoading(true)
    try {
      await memberProfileApi.update(user.member_profile.id, {
        is_staff: checked,
      })
      setIsStaff(checked)
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: `User ${checked ? "marked as" : "removed from"} staff`,
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update staff status",
      })
    } finally {
      setStaffToggleLoading(false)
    }
  }

  if (userError) {
    const status = (userError as any).status
    if (status === 403) return <Unauthorized actionHref="/admin/users" />
    if (status === 401) {
      logout()
      return null
    }
    return (
      <AdminDashboardShell title="Error">
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <p className="text-lg font-medium">Failed to load user</p>
          <p className="text-muted-foreground">{userError.message}</p>
        </div>
      </AdminDashboardShell>
    )
  }

  if (loading) {
    return (
      <AdminDashboardShell title="User Detail">
        <div className="space-y-4 p-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AdminDashboardShell>
    )
  }

  if (!user) {
    return (
      <AdminDashboardShell title="User Detail">
        <div className="p-8 text-center text-gray-500">User not found</div>
      </AdminDashboardShell>
    )
  }

  const isDeleted = !!user.deleted_at
  const isSaving = updateMutation.isPending || syncRolesMutation.isPending

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
                  <Badge variant="destructive">Deleted</Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-100 text-green-800"
                  >
                    Active
                  </Badge>
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    value={editData.username}
                    onChange={(e) =>
                      setEditData({ ...editData, username: e.target.value })
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign Roles</label>
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
                      setSelectedRoles((user.roles || []) as AdminRole[])
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
                              disabled={removeRoleMutation.isPending}
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
                            onChange={(e) =>
                              setSelectedRoleToAdd(e.target.value)
                            }
                            className="rounded border px-2 py-1 text-sm"
                            disabled={assignRoleMutation.isPending}
                          >
                            <option value="">Select a role...</option>
                            {roles
                              .filter(
                                (role) =>
                                  !user.roles?.some(
                                    (ur) => ur.name === role.name
                                  )
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
                            disabled={assignRoleMutation.isPending}
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
                            disabled={assignRoleMutation.isPending}
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
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {user.member_profile.first_name && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      First Name
                    </p>
                    <p className="font-medium">
                      {user.member_profile.first_name}
                    </p>
                  </div>
                )}
                {user.member_profile.last_name && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Last Name
                    </p>
                    <p className="font-medium">
                      {user.member_profile.last_name}
                    </p>
                  </div>
                )}
                {user.member_profile.phone_number && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Phone
                    </p>
                    <p className="font-medium">
                      {user.member_profile.phone_number}
                    </p>
                  </div>
                )}
              </div>

              {/* Demographics */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {user.member_profile.date_of_birth && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Date of Birth
                    </p>
                    <p className="font-medium">
                      {new Date(
                        user.member_profile.date_of_birth
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {user.member_profile.gender && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Gender
                    </p>
                    <p className="font-medium capitalize">
                      {user.member_profile.gender}
                    </p>
                  </div>
                )}
                {user.member_profile.occupation && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Occupation
                    </p>
                    <p className="font-medium">
                      {user.member_profile.occupation}
                    </p>
                  </div>
                )}
              </div>

              {/* Location */}
              {(user.member_profile.county ||
                user.member_profile.sub_county ||
                user.member_profile.ward) && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {user.member_profile.county && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        County
                      </p>
                      <p className="font-medium">
                        {user.member_profile.county.name}
                      </p>
                    </div>
                  )}
                  {user.member_profile.sub_county && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Sub-County
                      </p>
                      <p className="font-medium">
                        {user.member_profile.sub_county}
                      </p>
                    </div>
                  )}
                  {user.member_profile.ward && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Ward
                      </p>
                      <p className="font-medium">{user.member_profile.ward}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Interests & Bio */}
              {user.member_profile.interests && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Interests
                  </p>
                  <p className="font-medium">{user.member_profile.interests}</p>
                </div>
              )}
              {user.member_profile.bio && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Bio
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.member_profile.bio}
                  </p>
                </div>
              )}

              {/* Emergency Contact */}
              {(user.member_profile.emergency_contact_name ||
                user.member_profile.emergency_contact_phone) && (
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                    Emergency Contact
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {user.member_profile.emergency_contact_name && (
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">
                          {user.member_profile.emergency_contact_name}
                        </p>
                      </div>
                    )}
                    {user.member_profile.emergency_contact_phone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">
                          {user.member_profile.emergency_contact_phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Consent Flags */}
              <div className="flex flex-wrap gap-4">
                <Badge
                  variant={
                    user.member_profile.terms_accepted ? "default" : "outline"
                  }
                >
                  Terms{" "}
                  {user.member_profile.terms_accepted
                    ? "Accepted"
                    : "Not Accepted"}
                </Badge>
                <Badge
                  variant={
                    user.member_profile.marketing_consent
                      ? "default"
                      : "outline"
                  }
                >
                  Marketing{" "}
                  {user.member_profile.marketing_consent
                    ? "Opted In"
                    : "Opted Out"}
                </Badge>
              </div>

              {/* Staff Status Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <label htmlFor="staff-toggle" className="text-sm font-medium">
                    Staff Member
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Mark this user as a staff member of Dadisi
                  </p>
                </div>
                <Switch
                  id="staff-toggle"
                  checked={isStaff}
                  onCheckedChange={handleStaffToggle}
                  disabled={staffToggleLoading}
                />
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
