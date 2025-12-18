"use client"

import { useState } from "react"
import { Upload, X } from "lucide-react"
import Swal from "sweetalert2"

import { AdminRole } from "@/types/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface BulkUser {
  email: string
  name?: string
  roles?: string[]
  error?: string
}

interface BulkInviteDialogProps {
  open: boolean
  roles: AdminRole[]
  onClose: () => void
  onInvite: (users: BulkUser[]) => Promise<void>
  isLoading?: boolean
}

export function BulkInviteDialog({
  open,
  roles,
  onClose,
  onInvite,
  isLoading = false,
}: BulkInviteDialogProps) {
  const [csvInput, setCsvInput] = useState("")
  const [parsedUsers, setParsedUsers] = useState<BulkUser[]>([])
  const [loading, setLoading] = useState(isLoading)
  const [stage, setStage] = useState<"input" | "preview">("input")

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const parseCSV = (text: string) => {
    const lines = text
      .trim()
      .split("\n")
      .filter((line) => line.trim())

    const users: BulkUser[] = []
    const errors: string[] = []

    lines.forEach((line, index) => {
      const parts = line.split(",").map((p) => p.trim())
      const email = parts[0]
      const name = parts[1] || undefined
      const roleNames = parts.slice(2).filter((r) => r)

      if (!email) {
        errors.push(`Row ${index + 1}: Email is required`)
        return
      }

      if (!validateEmail(email)) {
        errors.push(`Row ${index + 1}: Invalid email format (${email})`)
        return
      }

      users.push({
        email,
        name,
        roles: roleNames.length > 0 ? roleNames : undefined,
      })
    })

    if (errors.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Parsing Warnings",
        html: `<div class="text-left text-sm"><p>Some rows had issues:</p><ul class="list-disc list-inside mt-2">${errors
          .map((e) => `<li>${e}</li>`)
          .join("")}</ul></div>`,
        confirmButtonText: "Continue",
      })
    }

    setParsedUsers(users)
    setStage("preview")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setCsvInput(text)
      parseCSV(text)
    }
    reader.readAsText(file)
  }

  const handleParse = () => {
    if (!csvInput.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please enter CSV data or upload a file",
      })
      return
    }

    parseCSV(csvInput)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onInvite(parsedUsers)
      await Swal.fire({
        icon: "success",
        title: "Users Invited",
        text: `${parsedUsers.length} invitation${parsedUsers.length !== 1 ? "s" : ""} sent successfully`,
        timer: 2000,
      })
      setCsvInput("")
      setParsedUsers([])
      setStage("input")
      onClose()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send invitations"
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
      <div className="mx-4 max-h-96 w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-gray-950">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Bulk Invite Users</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {stage === "input" ? (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                CSV Format
              </label>
              <p className="mb-2 text-xs text-gray-500">
                Format: email, name (optional), role1, role2...
              </p>
              <p className="mb-3 text-xs text-gray-500">
                Example: john@example.com, John Doe, admin, events_manager
              </p>
              <Textarea
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="email1@example.com, John Doe, admin
email2@example.com, Jane Smith, finance"
                rows={6}
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Or</span>
              <label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  asChild
                >
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV File
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={handleParse}
                disabled={loading || !csvInput.trim()}
              >
                {loading ? "Processing..." : "Preview"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Preview</h3>
              <div className="max-h-48 overflow-x-auto overflow-y-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-900">
                    <tr className="border-b">
                      <th className="px-3 py-2 text-left">Email</th>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Roles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedUsers.map((user, idx) => (
                      <tr
                        key={idx}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <td className="px-3 py-2 font-mono text-xs">
                          {user.email}
                        </td>
                        <td className="px-3 py-2">{user.name || "-"}</td>
                        <td className="px-3 py-2 text-xs">
                          {user.roles?.join(", ") || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Total: {parsedUsers.length} user
                {parsedUsers.length !== 1 ? "s" : ""} to invite
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setStage("input")}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || parsedUsers.length === 0}
              >
                {loading ? "Sending..." : "Send Invitations"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
