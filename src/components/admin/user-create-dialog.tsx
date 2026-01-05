"use client"

import { useState } from "react"
import { Eye, EyeOff, X } from "lucide-react"
import Swal from "sweetalert2"

import { AdminRole } from "@/types/admin"
import { userApi } from "@/lib/api-admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

import { RoleSelector } from "./role-selector"

interface UserCreateDialogProps {
  open: boolean
  roles: AdminRole[]
  onClose: () => void
  onSuccess: () => void
}

export function UserCreateDialog({
  open,
  roles,
  onClose,
  onSuccess,
}: UserCreateDialogProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  })
  const [selectedRoles, setSelectedRoles] = useState<AdminRole[]>([])
  const [isStaff, setIsStaff] = useState(true) // Default to staff
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    if (!formData.username || formData.username.length < 3) {
      setError("Username must be at least 3 characters")
      return false
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    setLoading(true)
    try {
      await userApi.create({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        is_staff: isStaff,
        roles:
          selectedRoles.length > 0
            ? selectedRoles.map((r) => r.name)
            : undefined,
      })

      await Swal.fire({
        icon: "success",
        title: "User Created",
        text: `User ${formData.username} has been created successfully`,
        timer: 2000,
      })

      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
      })
      setSelectedRoles([])
      setIsStaff(true)

      onSuccess()
      onClose()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create user"
      setError(errorMessage)
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 dark:bg-gray-950">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Create Staff User</h2>
            <p className="text-sm text-muted-foreground">
              Create a new staff member account
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                First Name
              </label>
              <Input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                placeholder="John"
                disabled={loading}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Last Name
              </label>
              <Input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                placeholder="Doe"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Username *</label>
            <Input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="johndoe"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="john@example.com"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password *</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="At least 8 characters"
                disabled={loading}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Assign Roles
            </label>
            <RoleSelector
              roles={roles}
              selectedRoles={selectedRoles}
              onSelectionChange={setSelectedRoles}
              disabled={loading}
            />
          </div>

          {/* Staff Status - Always on for staff user creation */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
            <div className="space-y-0.5">
              <label htmlFor="is-staff" className="text-sm font-medium">
                Staff Member
              </label>
              <p className="text-xs text-muted-foreground">
                This user will be marked as a Dadisi staff member
              </p>
            </div>
            <Switch id="is-staff" checked={true} disabled={true} />
          </div>

          {error && (
            <div className="rounded border border-red-300 bg-red-100 p-3 text-sm text-red-800 dark:border-red-700 dark:bg-red-900 dark:text-red-100">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Staff User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
