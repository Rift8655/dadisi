"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/store/auth"
import { Edit2, Plus, Search, Trash2 } from "lucide-react"
import Swal from "sweetalert2"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { blogApi } from "@/lib/api-admin"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Unauthorized } from "@/components/unauthorized"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Tag {
  id: number
  name: string
  slug: string
  post_count?: number
  created_at?: string
}

export default function TagsPage() {
  const logout = useAuth((s) => s.logout)
  const [searchTerm, setSearchTerm] = useState("")
  const [authorizationError, setAuthorizationError] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [formData, setFormData] = useState({ name: "" })
  const queryClient = useQueryClient()

  // Fetch tags
  const { data: tagsData, isLoading, error } = useQuery({
    queryKey: ["admin", "tags", searchTerm],
    queryFn: () => blogApi.tags.list({ search: searchTerm || undefined }),
  })

  const tags: Tag[] = Array.isArray(tagsData)
    ? tagsData
    : tagsData?.data || []

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => blogApi.tags.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] })
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
      blogApi.tags.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] })
      setEditingTag(null)
      setFormData({ name: "" })
      Swal.fire({ icon: "success", title: "Success", text: "Tag updated successfully", timer: 1500 })
    },
    onError: (error: any) => {
      Swal.fire({ icon: "error", title: "Error", text: error.message || "Failed to update tag" })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => blogApi.tags.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] })
      Swal.fire({ icon: "success", title: "Success", text: "Tag deleted successfully", timer: 1500 })
    },
    onError: (error: any) => {
      Swal.fire({ icon: "error", title: "Error", text: error.message || "Failed to delete tag" })
    },
  })

  useEffect(() => {
    if (error) {
      const status = (error as any).status
      if (status === 403) {
        setAuthorizationError(true)
      } else if (status === 401) {
        logout()
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to load tags"
        Swal.fire({ icon: "error", title: "Error", text: errorMessage })
      }
    }
  }, [error, logout])

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

  const handleDelete = async (tag: Tag) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Delete Tag",
      text: `Are you sure you want to delete "${tag.name}"? This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonColor: "#d33",
    })

    if (confirmed.isConfirmed) {
      deleteMutation.mutate(tag.id)
    }
  }

  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag)
    setFormData({ name: tag.name })
  }

  if (authorizationError) {
    return <Unauthorized actionHref="/admin" />
  }

  return (
    <AdminDashboardShell title="Blog Tags">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Manage blog post tags
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
          <CardHeader className="pb-3">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left font-medium">ID</th>
                    <th className="px-4 py-2 text-left font-medium">Name</th>
                    <th className="px-4 py-2 text-left font-medium">Slug</th>
                    <th className="px-4 py-2 text-left font-medium">Posts</th>
                    <th className="px-4 py-2 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        {isLoading ? "Loading tags..." : "No tags found"}
                      </td>
                    </tr>
                  ) : (
                    tags.map((tag) => (
                      <tr
                        key={tag.id}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <td className="px-4 py-2 text-gray-500">{tag.id}</td>
                        <td className="px-4 py-2 font-medium">{tag.name}</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {tag.slug}
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {tag.post_count || 0} post{tag.post_count !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isLoading}
                              onClick={() => openEditDialog(tag)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isLoading || deleteMutation.isPending}
                              onClick={() => handleDelete(tag)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Tag</DialogTitle>
            <DialogDescription>
              Add a new blog tag. The slug will be generated automatically.
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
              Update the tag details.
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
    </AdminDashboardShell>
  )
}
