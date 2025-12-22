"use client"

import { useState } from "react"
import { Edit2, X } from "lucide-react"

import { AdminRetentionSetting } from "@/types/admin"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface DataRetentionCardProps {
  setting: AdminRetentionSetting
  onUpdate: (setting: AdminRetentionSetting) => Promise<void>
  isLoading?: boolean
}

export function DataRetentionCard({
  setting,
  onUpdate,
  isLoading = false,
}: DataRetentionCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    retention_days: setting.retention_days,
    auto_delete: setting.auto_delete,
    description: setting.description,
  })
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    try {
      setError(null)
      if (editData.retention_days < 0 || editData.retention_days > 3650) {
        setError("Retention days must be between 0 and 3650 (10 years)")
        return
      }
      await onUpdate({
        ...setting,
        ...editData,
      })
      setIsEditing(false)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update retention setting"
      )
    }
  }

  const handleCancel = () => {
    setEditData({
      retention_days: setting.retention_days,
      auto_delete: setting.auto_delete,
      description: setting.description,
    })
    setIsEditing(false)
    setError(null)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg capitalize">
              {setting.data_type.replace("_", " ")}
            </CardTitle>
            <CardDescription className="mt-1">
              {setting.updated_by_user
                ? `Last updated by ${setting.updated_by_user.username}`
                : "Not yet updated"}
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Retention Period (Days)
              </label>
              <Input
                type="number"
                min="0"
                max="3650"
                value={editData.retention_days}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    retention_days: parseInt(e.target.value) || 0,
                  })
                }
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                {editData.retention_days === 0
                  ? "Data will be deleted immediately"
                  : editData.retention_days === 1
                    ? "Data will be deleted after 1 day"
                    : `Data will be deleted after ${editData.retention_days} days`}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto-Delete</label>
                <Switch
                  checked={editData.auto_delete}
                  onCheckedChange={(checked) =>
                    setEditData({ ...editData, auto_delete: checked })
                  }
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500">
                {editData.auto_delete
                  ? "Data will be automatically deleted when retention period expires"
                  : "Data must be manually deleted after retention period"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    description: e.target.value,
                  })
                }
                placeholder="Enter description..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Retention Period
                </p>
                <p className="text-2xl font-bold">{setting.retention_days}</p>
                <p className="text-xs text-gray-500">
                  {setting.retention_days === 1 ? "day" : "days"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Auto-Delete
                </p>
                <p className="text-lg font-semibold">
                  {setting.auto_delete ? (
                    <span className="text-green-600">Enabled</span>
                  ) : (
                    <span className="text-gray-600">Disabled</span>
                  )}
                </p>
              </div>
            </div>

            {setting.description && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                  Description
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {setting.description}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
