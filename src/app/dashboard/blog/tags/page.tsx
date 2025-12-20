"use client"

import { useState } from "react"
import { useAuth } from "@/store/auth"
import { Edit2, Plus, Trash2 } from "lucide-react"
import Swal from "sweetalert2"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UserDashboardShell } from "@/components/user-dashboard-shell"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Tag {
  id: number
  name: string
  slug: string
  post_count?: number
  requested_deletion_at?: string | null
}

// Author API for tags (user-owned)
const authorTagsApi = {
  list: () => api.get<Tag[]>("/api/user/blog/tags"),
  create: (data: { name: string }) => api.post<Tag>("/api/user/blog/tags", data),
  update: (id: number, data: { name: string }) =>
    api.put<Tag>(`/api/user/blog/tags/${id}`, data),
  requestDelete: (id: number) =>
    api.post<{ message: string }>(`/api/user/blog/tags/${id}/request-delete`),
}

export default function UserTagsPage() {
  const { user } = useAuth()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [formData, setFormData] = useState({ name: "" })
  const [hasSubscription] = useState(true) // TODO: Check actual subscription
  const queryClient = useQueryClient()

  // Fetch user's tags
  const { data: tagsData, isLoading } = useQuery({
    queryKey: ["user", "tags"],
    queryFn: () => authorTagsApi.list(),
    enabled: hasSubscription,
  })

  const tags: Tag[] = Array.isArray(tagsData) ? tagsData : []

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => authorTagsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "tags"] })
      setCreateDialogOpen(false)
      setFormData({ name: "" })
      Swal.fire({ icon: "success", title: "Success", text: "Tag created successfully", timer: 1500 })
    },
    onError: (error: any) => {
      Swal.fire({ icon: "error", title: "Error", text: error.message || "Failed to create tag" })
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      authorTagsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "tags"] })
      setEditingTag(null)
      setFormData({ name: "" })
      Swal.fire({ icon: "success", title: "Success", text: "Tag updated successfully", timer: 1500 })
    },
    onError: (error: any) => {
      Swal.fire({ icon: "error", title: "Error", text: error.message || "Failed to update tag" })
    },
  })

  // Request deletion mutation
  const requestDeleteMutation = useMutation({
    mutationFn: (id: number) => authorTagsApi.requestDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "tags"] })
      Swal.fire({
        icon: "info",
        title: "Deletion Requested",
        text: "Your deletion request has been submitted for staff review.",
        timer: 3000,
      })
    },
    onError: (error: any) => {
      Swal.fire({ icon: "error", title: "Error", text: error.message || "Failed to request deletion" })
    },
  })

  const handleCreate = () => {
    if (!formData.name.trim()) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Tag name is required" })
      return
    }
    createMutation.mutate({ name: formData.name })
  }

  const handleUpdate = () => {
    if (!editingTag || !formData.name.trim()) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Tag name is required" })
      return
    }
    updateMutation.mutate({
      id: editingTag.id,
      data: { name: formData.name },
    })
  }

  const handleRequestDelete = async (tag: Tag) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Request Deletion",
      html: `
        <p>You are requesting to delete the tag "<strong>${tag.name}</strong>".</p>
        <p class="mt-2 text-sm text-gray-500">This request will be reviewed by staff before the tag is deleted.</p>
      `,
      showCancelButton: true,
      confirmButtonText: "Submit Request",
    })

    if (confirmed.isConfirmed) {
      requestDeleteMutation.mutate(tag.id)
    }
  }

  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag)
    setFormData({ name: tag.name })
  }

  // Subscription gate
  if (!hasSubscription) {
    return (
      <UserDashboardShell title="My Tags">
        <Card className="max-w-lg mx-auto mt-12">
          <CardHeader className="text-center">
            <CardTitle>Premium Feature</CardTitle>
            <CardDescription>
              Managing tags is a premium feature. Upgrade your subscription to unlock this capability.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/dashboard/subscription">Upgrade Now</Link>
            </Button>
          </CardContent>
        </Card>
      </UserDashboardShell>
    )
  }

  return (
    <UserDashboardShell title="My Tags">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Manage your blog post tags
                </CardDescription>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Tag
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 w-20 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : tags.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p className="mb-2">No tags yet</p>
                <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                  Create Your First Tag
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="group flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm shadow-sm transition-all hover:shadow-md"
                  >
                    <span className="font-medium">{tag.name}</span>
                    {tag.requested_deletion_at && (
                      <Badge variant="outline" className="ml-1 text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                        Pending
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({tag.post_count || 0})
                    </span>
                    <div className="ml-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditDialog(tag)}
                        disabled={!!tag.requested_deletion_at}
                        className="p-1 rounded hover:bg-muted disabled:opacity-50"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleRequestDelete(tag)}
                        disabled={!!tag.requested_deletion_at || requestDeleteMutation.isPending}
                        className="p-1 rounded hover:bg-muted text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Tag</DialogTitle>
            <DialogDescription>
              Add a new tag for your blog posts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter tag name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTag} onOpenChange={(open) => !open && setEditingTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update the tag name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter tag name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTag(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserDashboardShell>
  )
}
