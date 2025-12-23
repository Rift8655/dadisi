"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Folder,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  MoveVertical,
  MessageSquare,
} from "lucide-react"
import { forumApi } from "@/lib/api"
import { ForumCategory } from "@/schemas/forum"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { AccessDenied } from "@/components/admin/AccessDenied"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/store/auth"
import { toast } from "sonner"
import * as LucideIcons from "lucide-react"

export default function ForumCategoriesAdminPage() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "message-circle",
    order: 0,
    is_active: true,
  })

  // Permission check
  const canManage = user?.ui_permissions?.can_manage_forum_categories || 
                    user?.roles?.some((r: { name: string }) => ['admin', 'super_admin'].includes(r.name))

  // Fetch categories
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-forum-categories"],
    queryFn: () => forumApi.categories.list(),
    enabled: canManage,
  })

  const allCategories = data?.data ?? []
  const filteredCategories = allCategories.filter(cat => 
    cat.name.toLowerCase().includes(search.toLowerCase())
  )

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => forumApi.categories.create(data),
    onSuccess: () => {
      toast.success("Category created successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-forum-categories"] })
      setDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => toast.error(err.message || "Failed to create category"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: typeof formData }) => 
      forumApi.categories.update(slug, data),
    onSuccess: () => {
      toast.success("Category updated successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-forum-categories"] })
      setDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => toast.error(err.message || "Failed to update category"),
  })

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => forumApi.categories.delete(slug),
    onSuccess: () => {
      toast.success("Category deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-forum-categories"] })
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete category"),
  })

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon: "message-circle",
      order: 0,
      is_active: true,
    })
    setEditingCategory(null)
  }

  const handleEdit = (cat: ForumCategory) => {
    setEditingCategory(cat)
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      icon: cat.icon || "message-circle",
      order: cat.order || 0,
      is_active: cat.is_active ?? true,
    })
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCategory) {
      updateMutation.mutate({ slug: editingCategory.slug, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '')
  }

  const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
    // @ts-ignore
    const IconComponent = LucideIcons[name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())] || LucideIcons.HelpCircle
    return <IconComponent className={className} />
  }

  if (!isAuthenticated || !canManage) {
    return (
      <AdminDashboardShell title="Forum Categories">
        <AccessDenied 
          message="You don't have permission to manage forum categories."
          requiredPermission="Administrator"
          backHref="/admin/forum"
          backLabel="Back to Forum Admin"
        />
      </AdminDashboardShell>
    )
  }

  return (
    <AdminDashboardShell title="Forum Categories">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link href="/admin/forum">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Forum Admin
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Folder className="h-8 w-8 text-primary" />
              Categories Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize topics into logical categories for better discovery.
            </p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New Category
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="py-12 text-center text-destructive">
                Failed to load categories. Please try again.
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {search ? `No categories matching "${search}"` : "No categories created yet."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden md:table-cell">Slug</TableHead>
                    <TableHead className="hidden lg:table-cell">Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>
                        <MoveVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded">
                            <DynamicIcon name={cat.icon || "message-circle"} className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium block truncate">{cat.name}</span>
                            <span className="text-xs text-muted-foreground truncate block max-w-[200px]">
                              {cat.description}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm font-mono">
                        {cat.slug}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <MessageSquare className="h-3 w-3" />
                          {cat.threads_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cat.is_active ? (
                          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                            <Eye className="h-3 w-3 mr-1" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="h-3 w-3 mr-1" /> Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(cat)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete category "${cat.name}"? This will move or delete all threads in it.`)) {
                                deleteMutation.mutate(cat.slug)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Create New Category"}</DialogTitle>
              <DialogDescription>
                Configure how topics are grouped and displayed on the forum homepage.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="General Discussion"
                    value={formData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setFormData({ 
                        ...formData, 
                        name: newName,
                        slug: editingCategory ? formData.slug : generateSlug(newName)
                      });
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="general-discussion"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    disabled={!!editingCategory}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell members what topics belong here..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Lucide Icon Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="icon"
                      placeholder="message-circle"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    />
                    <div className="flex items-center justify-center p-2 bg-muted rounded w-10 shrink-0">
                      <DynamicIcon name={formData.icon} className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    See lucide.dev for icon names.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Active Status</Label>
                  <p className="text-xs text-muted-foreground">
                    Publicly visible categories appear on the forum homepage.
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingCategory ? "Save Changes" : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardShell>
  )
}
