"use client"

import { useState } from "react"
import { X } from "lucide-react"
import Swal from "sweetalert2"

import { AdminRole } from "@/types/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { RoleSelector } from "./role-selector"

interface UserInviteDialogProps {
  open: boolean
  roles: AdminRole[]
  onClose: () => void
  onInvite: (
    email: string,
    username: string,
    roleIds: number[],
    sendNotification: boolean
  ) => Promise<void>
  isLoading?: boolean
}

export function UserInviteDialog({
  open,
  roles,
  onClose,
  onInvite,
  isLoading = false,
}: UserInviteDialogProps) {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<AdminRole[]>([])
  const [sendNotification, setSendNotification] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(isLoading)

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)
    try {
      await onInvite(
        email,
        username,
        selectedRoles.map((r) => r.id),
        sendNotification
      )
      await Swal.fire({
        icon: "success",
        title: "User Invited",
        text: `Invitation sent to ${email}`,
        timer: 2000,
      })
      setEmail("")
      setUsername("")
      setSelectedRoles([])
      setSendNotification(true)
      onClose()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send invitation"
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
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-950">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Invite User</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email *</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Username *
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              disabled={loading}
              required
            />
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sendNotification"
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="sendNotification" className="text-sm">
              Send notification email
            </label>
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
              {loading ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
