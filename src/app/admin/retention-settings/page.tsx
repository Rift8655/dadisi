"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/store/auth"
import { RetentionSetting } from "@/types"
import { useAdminRetentionSettings, useUpdateRetentionSetting } from "@/hooks/useAdminRetention"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  Loader2,
  Save,
  X,
} from "lucide-react"

import { showError, showSuccess } from "@/lib/sweetalert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Unauthorized } from "@/components/unauthorized"

export default function AdminRetentionSettingsPage() {
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  
  // Hooks
  const { data: settings = [], isLoading: loading, error: fetchError } = useAdminRetentionSettings()
  const updateMutation = useUpdateRetentionSetting()

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingError, setEditingError] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<{
    retention_days: number
    auto_delete: boolean
    description: string
  }>({
    retention_days: 0,
    auto_delete: false,
    description: "",
  })

  useEffect(() => {
    if (fetchError) {
      const status = (fetchError as any).status
      if (status === 403) {
        // Handled by unauthorized check below if cumulative
      } else if (status === 401) {
        logout()
      } else {
        showError("Failed to fetch retention settings")
      }
    }
  }, [fetchError, logout])

  const calculateStatistics = () => {
    return {
      totalDataTypes: settings.length,
      autoDeleteEnabled: settings.filter((s) => s.auto_delete).length,
      averageRetentionDays:
        settings.length > 0
          ? Math.round(
              settings.reduce((sum, s) => sum + s.retention_days, 0) /
                settings.length
            )
          : 0,
    }
  }

  const getRetentionDescription = (days: number): string => {
    if (days === 0) return "Data will be deleted immediately"
    if (days === 1) return "Data will be deleted after 1 day"
    if (days < 7) return `Data will be deleted after ${days} days`
    if (days < 30)
      return `Data will be deleted after ${Math.ceil(days / 7)} weeks`
    if (days < 365)
      return `Data will be deleted after ${Math.ceil(days / 30)} months`
    return `Data will be deleted after ${Math.ceil(days / 365)} years`
  }

  const startEditing = (setting: RetentionSetting) => {
    setEditingId(setting.id)
    setEditingError(null)
    setEditingData({
      retention_days: setting.retention_days,
      auto_delete: setting.auto_delete,
      description: setting.description,
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingError(null)
    setEditingData({
      retention_days: 0,
      auto_delete: false,
      description: "",
    })
  }

  const validateRetentionDays = (days: number): string | null => {
    if (days < 0 || days > 3650) {
      return "Retention days must be between 0 and 3650 (10 years)"
    }
    return null
  }

  const saveSetting = async (id: number) => {
    const error = validateRetentionDays(editingData.retention_days)
    if (error) {
      setEditingError(error)
      return
    }

    try {
      setEditingError(null)
      await updateMutation.mutateAsync({ id, data: editingData })
      showSuccess("Retention setting updated successfully")
      setEditingId(null)
    } catch (error: unknown) {
      console.error("Failed to update retention setting:", error)
      const message = error instanceof Error ? error.message : "Failed to update retention setting"
      setEditingError(message)
      showError(message)
    }
  }

  const stats = calculateStatistics()

  if ((fetchError as any)?.status === 403) {
    return <Unauthorized actionHref="/admin" />
  }

  if (!user) {
    return (
      <AdminDashboardShell title="Data Retention">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading environment...</span>
        </div>
      </AdminDashboardShell>
    )
  }

  return (
    <AdminDashboardShell title="Data Retention">
      <div className="space-y-6">
        {/* Summary Statistics */}
        {!loading && settings.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Data Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalDataTypes}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Configured retention policies
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Auto-Delete Enabled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.autoDeleteEnabled}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stats.autoDeleteEnabled === stats.totalDataTypes
                    ? "All policies enabled"
                    : `${stats.totalDataTypes - stats.autoDeleteEnabled} policies disabled`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Retention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.averageRetentionDays}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">days</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Retention Policies</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure data retention rules for different data types
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="mr-3 h-6 w-6 animate-spin text-primary" />
              <span>Loading retention settings...</span>
            </CardContent>
          </Card>
        ) : settings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                No retention settings found
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {settings.map((setting) => (
              <Card key={setting.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-lg capitalize">
                        {setting.data_type.replace("_", " ")}
                        {setting.auto_delete ? (
                          <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Auto-Delete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-900 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            Manual
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {setting.updated_at ? (
                          <>
                            Last updated{" "}
                            {new Date(setting.updated_at).toLocaleDateString()}
                          </>
                        ) : (
                          <>Not yet updated</>
                        )}
                      </CardDescription>
                    </div>
                    {editingId === setting.id ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveSetting(setting.id)}
                          disabled={!!editingError || updateMutation.isPending}
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-1 h-4 w-4" />
                          )}
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(setting)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 border-t pt-4">
                  {editingId === setting.id ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`retention_days_${setting.id}`}>
                          Retention Period (Days)
                        </Label>
                        <Input
                          id={`retention_days_${setting.id}`}
                          type="number"
                          min="0"
                          max="3650"
                          value={editingData.retention_days}
                          onChange={(e) => {
                            const value = Number(e.target.value)
                            setEditingData((prev) => ({
                              ...prev,
                              retention_days: value,
                            }))
                            setEditingError(validateRetentionDays(value))
                          }}
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                          {getRetentionDescription(editingData.retention_days)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`auto_delete_${setting.id}`}>
                            Enable Auto-Delete
                          </Label>
                          <Switch
                            id={`auto_delete_${setting.id}`}
                            checked={editingData.auto_delete}
                            onCheckedChange={(checked) =>
                              setEditingData((prev) => ({
                                ...prev,
                                auto_delete: checked,
                              }))
                            }
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {editingData.auto_delete
                            ? "Data will be automatically deleted when retention period expires"
                            : "Data must be manually deleted after retention period expires"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`description_${setting.id}`}>
                          Description
                        </Label>
                        <Textarea
                          id={`description_${setting.id}`}
                          value={editingData.description}
                          onChange={(e) =>
                            setEditingData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Describe the data type and retention policy..."
                          rows={3}
                        />
                      </div>

                      {editingError && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {editingError}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Retention Period
                        </p>
                        <p className="text-2xl font-bold">
                          {setting.retention_days}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {setting.retention_days === 1 ? "day" : "days"}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {getRetentionDescription(setting.retention_days)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Status
                        </p>
                        <div className="mt-2">
                          {setting.auto_delete ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <span className="font-semibold text-green-600">
                                Auto-Delete Enabled
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-amber-600" />
                              <span className="font-semibold text-amber-600">
                                Manual Delete
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {setting.description && (
                        <div className="md:col-span-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Description
                          </p>
                          <p className="mt-2 text-sm text-foreground">
                            {setting.description}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminDashboardShell>
  )
}
