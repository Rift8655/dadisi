"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import {
  AdminPermission,
  PERMISSION_CATEGORIES,
  PermissionCategory,
} from "@/types/admin"
import { Checkbox } from "@/components/ui/checkbox"

interface RolePermissionTreeProps {
  availablePermissions: AdminPermission[]
  selectedPermissions: AdminPermission[]
  onSelectionChange: (permissions: AdminPermission[]) => void
  disabled?: boolean
}

export function RolePermissionTree({
  availablePermissions,
  selectedPermissions,
  onSelectionChange,
  disabled = false,
}: RolePermissionTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set([
      "User Management",
      "Event Management",
      "Financial",
      "Content",
      "Reports",
      "Settings",
    ])
  )

  const groupedPermissions = availablePermissions.reduce(
    (acc, perm) => {
      const category = PERMISSION_CATEGORIES[perm.name] || "Other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(perm)
      return acc
    },
    {} as Record<string, AdminPermission[]>
  )

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const togglePermission = (permission: AdminPermission) => {
    const isSelected = selectedPermissions.some((p) => p.id === permission.id)
    if (isSelected) {
      onSelectionChange(
        selectedPermissions.filter((p) => p.id !== permission.id)
      )
    } else {
      onSelectionChange([...selectedPermissions, permission])
    }
  }

  const toggleCategoryPermissions = (category: string) => {
    const categoryPermissions = groupedPermissions[category] || []
    const allSelected = categoryPermissions.every((p) =>
      selectedPermissions.some((sp) => sp.id === p.id)
    )

    if (allSelected) {
      onSelectionChange(
        selectedPermissions.filter(
          (p) => !categoryPermissions.some((cp) => cp.id === p.id)
        )
      )
    } else {
      const newPermissions = [
        ...selectedPermissions,
        ...categoryPermissions.filter(
          (p) => !selectedPermissions.some((sp) => sp.id === p.id)
        ),
      ]
      onSelectionChange(newPermissions)
    }
  }

  return (
    <div className="max-h-96 space-y-2 overflow-y-auto rounded-md border p-4">
      {Object.entries(groupedPermissions).map(([category, permissions]) => {
        const categoryPermissions = permissions as AdminPermission[]
        const allSelected = categoryPermissions.every((p) =>
          selectedPermissions.some((sp) => sp.id === p.id)
        )
        const someSelected = categoryPermissions.some((p) =>
          selectedPermissions.some((sp) => sp.id === p.id)
        )
        const isExpanded = expandedCategories.has(
          category as PermissionCategory
        )

        return (
          <div key={category}>
            <button
              onClick={() => toggleCategory(category)}
              disabled={disabled}
              className="flex w-full items-center gap-2 rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              <Checkbox
                checked={allSelected}
                onCheckedChange={() => toggleCategoryPermissions(category)}
                disabled={disabled}
                style={{
                  accentColor:
                    someSelected && !allSelected ? "auto" : undefined,
                }}
              />
              <span className="flex-1 text-left text-sm font-medium">
                {category}
              </span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {isExpanded && (
              <div className="ml-4 space-y-1">
                {categoryPermissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <Checkbox
                      checked={selectedPermissions.some(
                        (p) => p.id === permission.id
                      )}
                      onCheckedChange={() => togglePermission(permission)}
                      disabled={disabled}
                    />
                    <span className="font-mono text-sm">{permission.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
