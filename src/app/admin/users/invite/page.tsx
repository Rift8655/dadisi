"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/store/auth"
import { ArrowLeft, Mail, Upload, Loader2 } from "lucide-react"
import Swal from "sweetalert2"

import { AdminRole, BulkUser } from "@/types/admin"
import { useRoles } from "@/hooks/useRoles"
import { useInviteUser, useBulkInviteUsers } from "@/hooks/useUsers"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { RoleSelector } from "@/components/admin/role-selector"
import { Unauthorized } from "@/components/unauthorized"

export default function InviteUsersPage() {
  const logout = useAuth((s) => s.logout)
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useRoles({
    include_permissions: false,
    per_page: 100
  })
  
  const roles = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || []
  
  const inviteUserMutation = useInviteUser()
  const bulkInviteMutation = useBulkInviteUsers()

  const [singleFormData, setSingleFormData] = useState({
    email: "",
    name: "",
    sendNotification: true,
  })
  const [selectedRoles, setSelectedRoles] = useState<AdminRole[]>([])

  const [csvInput, setCsvInput] = useState("")
  const [parsedUsers, setParsedUsers] = useState<BulkUser[]>([])
  const [bulkStage, setBulkStage] = useState<"input" | "preview">("input")

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSingleInvite = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!singleFormData.email || !validateEmail(singleFormData.email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
      })
      return
    }

    try {
      await inviteUserMutation.mutateAsync({
        email: singleFormData.email,
        name: singleFormData.name || undefined,
        roles: selectedRoles.map((r) => r.name),
        send_notification: singleFormData.sendNotification,
      })

      await Swal.fire({ icon: "success", title: "Invitation Sent", text: `Invitation sent to ${singleFormData.email}`, timer: 2000 })

      setSingleFormData({ email: "", name: "", sendNotification: true })
      setSelectedRoles([])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send invitation"
      Swal.fire({ icon: "error", title: "Error", text: errorMessage })
    }
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
    setBulkStage("preview")
  }

  const handleBulkParse = () => {
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

  const handleBulkInvite = async () => {
    try {
      await bulkInviteMutation.mutateAsync({
        users: parsedUsers.map((u) => ({
          email: u.email,
          name: u.name,
          roles: u.roles,
          send_notification: true,
        })),
      })

      await Swal.fire({ icon: "success", title: "Invitations Sent", text: `${parsedUsers.length} invitation${parsedUsers.length !== 1 ? "s" : ""} sent successfully`, timer: 2000 })

      setCsvInput("")
      setParsedUsers([])
      setBulkStage("input")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send invitations"
      Swal.fire({ icon: "error", title: "Error", text: errorMessage })
    }
  }

  if (rolesError && (rolesError as any).status === 403) {
    return <Unauthorized actionHref="/admin/users" />
  }
  
  if (rolesError && (rolesError as any).status === 401) {
    logout()
    return null
  }

  const isLoading = inviteUserMutation.isPending || bulkInviteMutation.isPending || rolesLoading

  return (
    <AdminDashboardShell title="Invite Users">
      <div className="space-y-4">
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Invite Users</CardTitle>
            <CardDescription>
              Send invitations to new users and assign roles to them
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex gap-2 border-b">
              <button
                onClick={() => setActiveTab("single")}
                className={`border-b-2 px-4 py-2 font-medium transition-colors ${
                  activeTab === "single"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Mail className="mr-2 inline h-4 w-4" />
                Single Invite
              </button>
              <button
                onClick={() => setActiveTab("bulk")}
                className={`border-b-2 px-4 py-2 font-medium transition-colors ${
                  activeTab === "bulk"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Upload className="mr-2 inline h-4 w-4" />
                Bulk Invite
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {activeTab === "single" ? (
              <form
                onSubmit={handleSingleInvite}
                className="max-w-md space-y-4"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={singleFormData.email}
                    onChange={(e) =>
                      setSingleFormData({
                        ...singleFormData,
                        email: e.target.value,
                      })
                    }
                    placeholder="user@example.com"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Name (Optional)
                  </label>
                  <Input
                    type="text"
                    value={singleFormData.name}
                    onChange={(e) =>
                      setSingleFormData({
                        ...singleFormData,
                        name: e.target.value,
                      })
                    }
                    placeholder="John Doe"
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendNotification"
                    checked={singleFormData.sendNotification}
                    onChange={(e) =>
                      setSingleFormData({
                        ...singleFormData,
                        sendNotification: e.target.checked,
                      })
                    }
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="sendNotification" className="text-sm">
                    Send notification email
                  </label>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {inviteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {inviteUserMutation.isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </form>
            ) : bulkStage === "input" ? (
              <div className="max-w-2xl space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    CSV Format
                  </label>
                  <p className="mb-2 text-xs text-gray-500">
                    Format: email, name (optional), role1, role2...
                  </p>
                  <p className="mb-3 text-xs text-gray-500">
                    Example:
                    <br />
                    john@example.com, John Doe, admin, events_manager
                    <br />
                    jane@example.com, Jane Smith, finance
                  </p>
                  <Textarea
                    value={csvInput}
                    onChange={(e) => setCsvInput(e.target.value)}
                    placeholder="email1@example.com, John Doe, admin
email2@example.com, Jane Smith, finance"
                    rows={6}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Or</span>
                  <label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
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
                      disabled={isLoading}
                      className="hidden"
                    />
                  </label>
                </div>

                <Button
                  onClick={handleBulkParse}
                  disabled={isLoading || !csvInput.trim()}
                >
                  Preview
                </Button>
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

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setBulkStage("input")}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleBulkInvite}
                    disabled={isLoading || parsedUsers.length === 0}
                  >
                    {bulkInviteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {bulkInviteMutation.isPending ? "Sending..." : "Send Invitations"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardShell>
  )
}
