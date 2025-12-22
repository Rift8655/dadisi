"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

interface Category {
  id: number
  name: string
  slug: string
  description?: string | null
  post_count?: number
  requested_deletion_at?: string | null
}

// Author API for categories (user-owned)
const authorCategoriesApi = {
  list: () => api.get<Category[]>("/api/user/blog/categories"),
  create: (data: { name: string; description?: string }) =>
    api.post<Category>("/api/user/blog/categories", data),
  update: (id: number, data: { name: string; description?: string }) =>
    api.put<Category>(`/api/user/blog/categories/${id}`, data),
  requestDelete: (id: number) =>
    api.post<{ message: string }>(`/api/user/blog/categories/${id}/request-delete`),
}

export default function UserCategoriesPage() {
  const { user } = useAuth()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [hasSubscription] = useState(true) // TODO: Check actual subscription
  const queryClient = useQueryClient()

  // Fetch user's categories
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ["user", "categories"],
    queryFn: () => authorCategoriesApi.list(),
    enabled: hasSubscription,
  })

  const categories: Category[] = Array.isArray(categoriesData) ? categoriesData : []

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      authorCategoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "categories"] })
      setCreateDialogOpen(false)
      setFormData({ name: "", description: "" })
      Swal.fire({ icon: "success", title: "Success", text: "Category created successfully", timer: 1500 })
    },
    onError: (error: any) => {
      Swal.fire({ icon: "error", title: "Error", text: error.message || "Failed to create category" })
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; description?: string } }) =>
      authorCategoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "categories"] })
      setEditingCategory(null)
      setFormData({ name: "", description: "" })
      Swal.fire({ icon: "success", title: "Success", text: "Category updated successfully", timer: 1500 })
    },
    onError: (error: any) => {
      Swal.fire({ icon: "error", title: "Error", text: error.message || "Failed to update category" })
    },
  })

  // Request deletion mutation
  const requestDeleteMutation = useMutation({
    mutationFn: (id: number) => authorCategoriesApi.requestDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "categories"] })
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
      Swal.fire({ icon: "warning", title: "Validation", text: "Category name is required" })
      return
    }
    createMutation.mutate({ name: formData.name, description: formData.description || undefined })
  }

  const handleUpdate = () => {
    if (!editingCategory || !formData.name.trim()) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Category name is required" })
      return
    }
    updateMutation.mutate({
      id: editingCategory.id,
      data: { name: formData.name, description: formData.description || undefined },
    })
  }

  const handleRequestDelete = async (category: Category) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Request Deletion",
      html: `
        <p>You are requesting to delete the category "<strong>${category.name}</strong>".</p>
        <p class="mt-2 text-sm text-gray-500">This request will be reviewed by staff before the category is deleted.</p>
      `,
      showCancelButton: true,
      confirmButtonText: "Submit Request",
    })

    if (confirmed.isConfirmed) {
      requestDeleteMutation.mutate(category.id)
    }
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, description: category.description || "" })
  }

  // Subscription gate
  if (!hasSubscription) {
    return (
      <UserDashboardShell title="My Categories">
        <Card className="max-w-lg mx-auto mt-12">
          <CardHeader className="text-center">
            <CardTitle>Premium Feature</CardTitle>
            <CardDescription>
              Managing categories is a premium feature. Upgrade your subscription to unlock this capability.
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
    <UserDashboardShell title="My Categories">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Manage your blog post categories
                </CardDescription>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p className="mb-2">No categories yet</p>
                <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                  Create Your First Category
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{category.name}</h4>
                        {category.requested_deletion_at && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                            Pending Deletion
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {category.description || "No description"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.post_count || 0} post{category.post_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(category)}
                        disabled={!!category.requested_deletion_at}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRequestDelete(category)}
                        disabled={!!category.requested_deletion_at || requestDeleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
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
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>
              Add a new category for your blog posts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter category description"
                rows={3}
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
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter category description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
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
