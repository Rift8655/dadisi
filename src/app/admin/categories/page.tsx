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
import { Textarea } from "@/components/ui/textarea"

interface Category {
  id: number
  name: string
  slug: string
  description?: string | null
  post_count?: number
  created_at?: string
}

export default function CategoriesPage() {
  const logout = useAuth((s) => s.logout)
  const [searchTerm, setSearchTerm] = useState("")
  const [authorizationError, setAuthorizationError] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const queryClient = useQueryClient()

  // Fetch categories
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ["admin", "categories", searchTerm],
    queryFn: () => blogApi.categories.list({ search: searchTerm || undefined }),
  })

  const categories: Category[] = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.data || []

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      blogApi.categories.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] })
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
      blogApi.categories.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] })
      setEditingCategory(null)
      setFormData({ name: "", description: "" })
      Swal.fire({ icon: "success", title: "Success", text: "Category updated successfully", timer: 1500 })
    },
    onError: (error: any) => {
      Swal.fire({ icon: "error", title: "Error", text: error.message || "Failed to update category" })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => blogApi.categories.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] })
      Swal.fire({ icon: "success", title: "Success", text: "Category deleted successfully", timer: 1500 })
    },
    onError: (error: any) => {
      Swal.fire({ icon: "error", title: "Error", text: error.message || "Failed to delete category" })
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
        const errorMessage = error instanceof Error ? error.message : "Failed to load categories"
        Swal.fire({ icon: "error", title: "Error", text: errorMessage })
      }
    }
  }, [error, logout])

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

  const handleDelete = async (category: Category) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Delete Category",
      text: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonColor: "#d33",
    })

    if (confirmed.isConfirmed) {
      deleteMutation.mutate(category.id)
    }
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, description: category.description || "" })
  }

  if (authorizationError) {
    return <Unauthorized actionHref="/admin" />
  }

  return (
    <AdminDashboardShell title="Blog Categories">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Manage blog post categories
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
          <CardHeader className="pb-3">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search categories..."
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
                    <th className="px-4 py-2 text-left font-medium">Description</th>
                    <th className="px-4 py-2 text-left font-medium">Posts</th>
                    <th className="px-4 py-2 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        {isLoading ? "Loading categories..." : "No categories found"}
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr
                        key={category.id}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <td className="px-4 py-2 text-gray-500">{category.id}</td>
                        <td className="px-4 py-2 font-medium">{category.name}</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {category.slug}
                        </td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {category.description || "-"}
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {category.post_count || 0} post{category.post_count !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isLoading}
                              onClick={() => openEditDialog(category)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isLoading || deleteMutation.isPending}
                              onClick={() => handleDelete(category)}
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
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>
              Add a new blog category. The slug will be generated automatically.
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
    </AdminDashboardShell>
  )
}
