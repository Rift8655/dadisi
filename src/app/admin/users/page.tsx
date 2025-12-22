"use client"

import { useEffect, useState } from "react"
import { useAdminUI } from "@/store/adminUI"
import { useAuth } from "@/store/auth"
import { Plus, Search } from "lucide-react"
import Swal from "sweetalert2"

import { AdminRole, AdminUser, PaginatedResponse } from "@/types/admin"
import { useUsers, useDeleteUser, useRestoreUser, useForceDeleteUser, useInviteUser, useBulkDeleteUsers, useBulkRestoreUsers, useBulkAssignRole, useBulkRemoveRole } from "@/hooks/useUsers"
import { useRoles } from "@/hooks/useRoles"
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
import { UserInviteDialog } from "@/components/admin/user-invite-dialog"
import { UserList } from "@/components/admin/user-list"
import { Unauthorized } from "@/components/unauthorized"

export default function UsersPage() {
  const user = useAuth((s) => s.user)
  const isLoading = useAuth((s) => s.isLoading)
  const logout = useAuth((s) => s.logout)
  const {
    filters,
    pagination,
    setUserSearch,
    setUserRoleFilter,
    setUserStatusFilter,
    setUsersPagination,
  } = useAdminUI()

  const { data: usersData, isLoading: usersLoading, error: usersError } = useUsers({
    search: filters.userSearch,
    role: filters.userRoleFilter || undefined,
    status: filters.userStatusFilter,
    page: pagination.usersPage,
    per_page: pagination.usersPerPage,
  })

  const { data: rolesData, isLoading: rolesLoading } = useRoles()

  const deleteMutation = useDeleteUser()
  const restoreMutation = useRestoreUser()
  const forceDeleteMutation = useForceDeleteUser()
  const inviteMutation = useInviteUser()
  const bulkDeleteMutation = useBulkDeleteUsers()
  const bulkRestoreMutation = useBulkRestoreUsers()
  const bulkAssignRoleMutation = useBulkAssignRole()
  const bulkRemoveRoleMutation = useBulkRemoveRole()

  const users = Array.isArray(usersData) ? usersData : usersData?.data || []
  const roles = Array.isArray(rolesData) ? rolesData : rolesData?.data || []
  const totalPages = Array.isArray(usersData) ? 1 : (usersData?.last_page || usersData?.meta?.last_page || 1)

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [authorizationError, setAuthorizationError] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: "delete" | "restore" | "forceDelete" | null
    user: AdminUser | null
  }>({
    open: false,
    action: null,
    user: null,
  })


  useEffect(() => {
    if (usersError) {
      const status = (usersError as any).status
      if (status === 403) {
        setAuthorizationError(true)
      } else if (status === 401) {
        logout()
      } else {
        const errorMessage = usersError instanceof Error ? usersError.message : "Failed to load users"
        Swal.fire({ icon: "error", title: "Error", text: errorMessage })
      }
    }
  }, [usersError, logout])

  const handleDelete = async (targetUser: AdminUser) => {
    setConfirmDialog({
      open: true,
      action: "delete",
      user: targetUser,
    })
  }

  const handleRestore = async (targetUser: AdminUser) => {
    setConfirmDialog({
      open: true,
      action: "restore",
      user: targetUser,
    })
  }

  const handleForceDelete = async (targetUser: AdminUser) => {
    setConfirmDialog({
      open: true,
      action: "forceDelete",
      user: targetUser,
    })
  }

  const confirmAction = async () => {
    const { action, user: targetUser } = confirmDialog
    if (!action || !targetUser) return

    try {
      switch (action) {
        case "delete":
          await deleteMutation.mutateAsync(targetUser.id)
          break
        case "restore":
          await restoreMutation.mutateAsync(targetUser.id)
          break
        case "forceDelete":
          await forceDeleteMutation.mutateAsync(targetUser.id)
          break
      }

      await Swal.fire({ icon: "success", title: "Success", text: `User ${action === "delete" ? "deleted" : action === "restore" ? "restored" : "permanently deleted"} successfully`, timer: 1500 })

      setConfirmDialog({ open: false, action: null, user: null })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to perform action"
      Swal.fire({ icon: "error", title: "Error", text: errorMessage })
    }
  }

  const handleInvite = async (email: string, username: string, roleIds: number[], sendNotification: boolean) => {
    const roleNames = roles.filter((r) => roleIds.includes(r.id)).map((r) => r.name)
    await inviteMutation.mutateAsync({ email, username, roles: roleNames, send_notification: sendNotification })
  }

  const handleBulkDelete = async (selectedUsers: AdminUser[]) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Delete Users",
      text: `Are you sure you want to delete ${selectedUsers.length} user${selectedUsers.length !== 1 ? "s" : ""}?`,
      showCancelButton: true,
    })

    if (confirmed.isConfirmed) {
      try {
        await bulkDeleteMutation.mutateAsync(selectedUsers.map((u) => u.id))
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: `${selectedUsers.length} user${selectedUsers.length !== 1 ? "s" : ""} deleted successfully`,
          timer: 1500,
        })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete users"
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        })
      }
    }
  }

  const handleBulkRestore = async (selectedUsers: AdminUser[]) => {
    try {
      await bulkRestoreMutation.mutateAsync(selectedUsers.map((u) => u.id))
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: `${selectedUsers.length} user${selectedUsers.length !== 1 ? "s" : ""} restored successfully`,
        timer: 1500,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to restore users"
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      })
    }
  }

  const handleBulkAssignRole = async (selectedUsers: AdminUser[], roleName: string) => {
    if (selectedUsers.length === 0 || !roleName) return

    try {
      const userIds = selectedUsers.map(u => u.id)
      await bulkAssignRoleMutation.mutateAsync({ ids: userIds, roleName })

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: `Role '${roleName}' assigned to ${userIds.length} user${userIds.length !== 1 ? "s" : ""} successfully`,
        timer: 1500,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to assign role to users"
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      })
    }
  }

  const handleBulkRemoveRole = async (selectedUsers: AdminUser[], roleName: string) => {
    if (selectedUsers.length === 0 || !roleName) return

    try {
      const userIds = selectedUsers.map((u) => u.id)
      await bulkRemoveRoleMutation.mutateAsync({ ids: userIds, roleName })

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: `Role '${roleName}' removed from ${userIds.length} user${userIds.length !== 1 ? "s" : ""} successfully`,
        timer: 1500,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove role from users"
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      })
    }
  }


  if (isLoading || !user) {
    return (
      <AdminDashboardShell title="User Management">
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
    <AdminDashboardShell title="User Management">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  Manage platform users and their roles
                </CardDescription>
              </div>
                {user?.ui_permissions.can_invite_users && (
                  <Button onClick={() => setInviteDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite User
                  </Button>
                )}
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Search</label>
                <div className="relative mt-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={filters.userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <select
                    value={filters.userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-950"
                  >
                    <option value="">All Roles</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={filters.userStatusFilter}
                    onChange={(e) =>
                      setUserStatusFilter(
                        e.target.value as "all" | "active" | "deleted"
                      )
                    }
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-950"
                  >
                    <option value="active">Active</option>
                    <option value="deleted">Deleted</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <UserList
              users={users}
              isLoading={usersLoading}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onForceDelete={handleForceDelete}
              onBulkDelete={user?.ui_permissions.can_bulk_manage_users ? handleBulkDelete : undefined}
              onBulkRestore={user?.ui_permissions.can_bulk_manage_users ? handleBulkRestore : undefined}
              onBulkAssignRole={user?.ui_permissions.can_bulk_manage_users ? handleBulkAssignRole : undefined}
              onBulkRemoveRole={user?.ui_permissions.can_bulk_manage_users ? handleBulkRemoveRole : undefined}
              roles={roles}
              currentPage={pagination.usersPage}
              totalPages={totalPages}
              onPageChange={(page) => setUsersPagination(page)}
            />
          </CardContent>
        </Card>
      </div>

      <UserInviteDialog
        open={inviteDialogOpen}
        roles={roles}
        onClose={() => setInviteDialogOpen(false)}
        onInvite={handleInvite}
      />

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
            ? `Are you sure you want to delete ${confirmDialog.user?.name || confirmDialog.user?.username}? They will be able to request restoration.`
            : confirmDialog.action === "restore"
              ? `Are you sure you want to restore ${confirmDialog.user?.name || confirmDialog.user?.username}?`
              : `Are you sure you want to permanently delete ${confirmDialog.user?.name || confirmDialog.user?.username}? This action cannot be undone.`
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
        onConfirm={confirmAction}
        onCancel={() =>
          setConfirmDialog({ open: false, action: null, user: null })
        }
      />
    </AdminDashboardShell>
  )
}
