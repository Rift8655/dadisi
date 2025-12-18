"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { AdminRole } from "@/types/admin"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

interface RoleSelectorProps {
  roles: AdminRole[]
  selectedRoles: AdminRole[]
  onSelectionChange: (roles: AdminRole[]) => void
  disabled?: boolean
  placeholder?: string
}

export function RoleSelector({
  roles,
  selectedRoles,
  onSelectionChange,
  disabled = false,
  placeholder = "Select roles...",
}: RoleSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleRole = (role: AdminRole) => {
    const isSelected = selectedRoles.some((r) => r.id === role.id)
    if (isSelected) {
      onSelectionChange(selectedRoles.filter((r) => r.id !== role.id))
    } else {
      onSelectionChange([...selectedRoles, role])
    }
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="w-full justify-between"
      >
        <span>
          {selectedRoles.length === 0
            ? placeholder
            : `${selectedRoles.length} role${selectedRoles.length !== 1 ? "s" : ""} selected`}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-white p-2 shadow-md dark:bg-gray-950">
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />

          <div className="max-h-48 space-y-2 overflow-y-auto">
            {filteredRoles.length === 0 ? (
              <p className="p-2 text-sm text-gray-500">No roles found</p>
            ) : (
              filteredRoles.map((role) => (
                <label
                  key={role.id}
                  className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  <Checkbox
                    checked={selectedRoles.some((r) => r.id === role.id)}
                    onCheckedChange={() => toggleRole(role)}
                  />
                  <span className="text-sm">{role.name}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}

      {selectedRoles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedRoles.map((role) => (
            <span
              key={role.id}
              className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-100"
            >
              {role.name}
              <button
                onClick={() => toggleRole(role)}
                className="ml-1 font-bold hover:opacity-70"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
