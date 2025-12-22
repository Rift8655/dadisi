"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateRole } from "@/hooks/useRoles"
import Swal from "sweetalert2"

interface RoleCreateDialogProps {
  open: boolean
  onClose: () => void
}

export function RoleCreateDialog({ open, onClose }: RoleCreateDialogProps) {
  const [name, setName] = useState("")
  const createRoleMutation = useCreateRole()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      await createRoleMutation.mutateAsync({ name: name.trim() })
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Role created successfully",
        timer: 1500,
      })
      setName("")
      onClose()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create role"
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
            <DialogDescription>
              Add a new role to the system. You can assign permissions after creating it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. moderator"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createRoleMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createRoleMutation.isPending || !name.trim()}>
              {createRoleMutation.isPending ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
