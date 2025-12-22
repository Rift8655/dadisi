"use client"

import { useState } from "react"
import Link from "next/link"
import { UserPlus, UserMinus, Eye, RotateCcw, Trash2, Zap } from "lucide-react"

import { AdminUser } from "@/types/admin"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

interface UserListProps {
  users: AdminUser[]
  isLoading?: boolean
  onEdit?: (user: AdminUser) => void
  onDelete?: (user: AdminUser) => void
  onRestore?: (user: AdminUser) => void
  onForceDelete?: (user: AdminUser) => void
  onBulkDelete?: (users: AdminUser[]) => void
  onBulkRestore?: (users: AdminUser[]) => void
  onBulkAssignRole?: (users: AdminUser[], role: string) => void
  onBulkRemoveRole?: (users: AdminUser[], role: string) => void
  roles?: Array<{ id: number; name: string }>
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export function UserList({
  users,
  isLoading = false,
  onEdit,
  onDelete,
  onRestore,
  onForceDelete,
  onBulkDelete,
  onBulkRestore,
  onBulkAssignRole,
  onBulkRemoveRole,
  roles = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: UserListProps) {
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([])
  const [selectedBulkRole, setSelectedBulkRole] = useState("")

  const handleSelectUser = (user: AdminUser) => {
    const isSelected = selectedUsers.some((u) => u.id === user.id)
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id))
    } else {
      setSelectedUsers([...selectedUsers, user])
    }
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users)
    }
  }

  const handleBulkAssignRole = () => {
    if (onBulkAssignRole && selectedBulkRole && selectedUsers.length > 0) {
      onBulkAssignRole(selectedUsers, selectedBulkRole)
    }
  }

  const handleBulkRemoveRole = () => {
    if (onBulkRemoveRole && selectedBulkRole && selectedUsers.length > 0) {
      onBulkRemoveRole(selectedUsers, selectedBulkRole)
    }
  }

  const isUserDeleted = (user: AdminUser) => !!user.deleted_at

  return (
    <div className="space-y-4">
      {selectedUsers.length > 0 && (
        <div className="flex flex-col gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""}{" "}
              selected
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedUsers([])}
            >
              Clear
            </Button>
          </div>

          {/* Bulk Role Management */}
          {(onBulkAssignRole || onBulkRemoveRole) && roles.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-medium">Role:</label>
              <select
                value={selectedBulkRole}
                onChange={(e) => setSelectedBulkRole(e.target.value)}
                className="rounded border px-2 py-1 text-sm"
              >
                <option value="">Select a role...</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
              {onBulkAssignRole && (
                <Button
                  size="sm"
                  onClick={handleBulkAssignRole}
                  disabled={!selectedBulkRole || isLoading}
                >
                  <UserPlus className="mr-1 h-3 w-3" />
                  Assign Role
                </Button>
              )}
              {onBulkRemoveRole && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkRemoveRole}
                  disabled={!selectedBulkRole || isLoading}
                >
                  <UserMinus className="mr-1 h-3 w-3" />
                  Remove Role
                </Button>
              )}
            </div>
          )}

          {/* Bulk Delete/Restore Actions */}
          <div className="flex gap-2">
            {onBulkDelete && selectedUsers.some((u) => !isUserDeleted(u)) && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  onBulkDelete(selectedUsers.filter((u) => !isUserDeleted(u)))
                }
              >
                Delete Selected
              </Button>
            )}
            {onBulkRestore && selectedUsers.some((u) => isUserDeleted(u)) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onBulkRestore(selectedUsers.filter((u) => isUserDeleted(u)))
                }
              >
                Restore Selected
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr className="border-b">
              <th className="px-4 py-2 text-center">
                <Checkbox
                  checked={
                    selectedUsers.length === users.length && users.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                  disabled={users.length === 0}
                />
              </th>
              <th className="px-4 py-2 text-left font-medium">Name</th>
              <th className="px-4 py-2 text-left font-medium">Email</th>
              <th className="px-4 py-2 text-left font-medium">Roles</th>
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="px-4 py-2 text-left font-medium">Joined</th>
              <th className="px-4 py-2 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  {isLoading ? "Loading users..." : "No users found"}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b hover:bg-gray-50 dark:hover:bg-gray-900 ${
                    isUserDeleted(user) ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-4 py-2 text-center">
                    <Checkbox
                      checked={selectedUsers.some((u) => u.id === user.id)}
                      onCheckedChange={() => handleSelectUser(user)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-medium">
                      {user.name || user.username}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{user.email}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <span
                            key={role.id}
                            className="inline-block rounded bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                          >
                            {role.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">No roles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {isUserDeleted(user) ? (
                      <span className="inline-block rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-100">
                        Deleted
                      </span>
                    ) : (
                      <span className="inline-block rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-1">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button size="sm" variant="ghost" disabled={isLoading}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {!isUserDeleted(user) && onDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isLoading}
                          onClick={() => onDelete(user)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                      {isUserDeleted(user) && onRestore && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isLoading}
                          onClick={() => onRestore(user)}
                        >
                          <RotateCcw className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      {isUserDeleted(user) && onForceDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isLoading}
                          onClick={() => onForceDelete(user)}
                        >
                          <Zap className="h-4 w-4 text-red-800" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
