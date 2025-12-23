"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Hash,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { forumApi } from "@/lib/api"
import { type ForumTag } from "@/schemas/forum"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { AccessDenied } from "@/components/admin/AccessDenied"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

export default function ForumTagsAdminPage() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<ForumTag | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    color: "#6366f1",
    description: "",
  })

  // Permission check
  const canManage = user?.ui_permissions?.can_manage_forum_tags || 
                    user?.roles?.some((r: { name: string }) => ['admin', 'super_admin'].includes(r.name))

  // Fetch tags
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-forum-tags"],
    queryFn: () => forumApi.tags.list(),
    enabled: canManage,
  })

  const allTags = data?.data ?? []
  const filteredTags = allTags.filter(tag => 
    tag.name.toLowerCase().includes(search.toLowerCase())
  )

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => forumApi.tags.create(data),
    onSuccess: () => {
      toast.success("Tag created successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-forum-tags"] })
      setDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => toast.error(err.message || "Failed to create tag"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof formData }) => 
      forumApi.tags.update(id, data),
    onSuccess: () => {
      toast.success("Tag updated successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-forum-tags"] })
      setDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => toast.error(err.message || "Failed to update tag"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => forumApi.tags.delete(id),
    onSuccess: () => {
      toast.success("Tag deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-forum-tags"] })
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete tag"),
  })

  const resetForm = () => {
    setFormData({ name: "", color: "#6366f1", description: "" })
    setEditingTag(null)
  }

  const handleEdit = (tag: ForumTag) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      color: tag.color || "#6366f1",
      description: tag.description || "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  if (!isAuthenticated || !canManage) {
    return (
      <AdminDashboardShell title="Forum Tags">
        <AccessDenied 
          message="You don't have permission to manage forum tags."
          requiredPermission="Administrator"
          backHref="/admin/forum"
          backLabel="Back to Forum Admin"
        />
      </AdminDashboardShell>
    )
  }

  return (
    <AdminDashboardShell title="Forum Tags">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link href="/admin/forum">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Forum Admin
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Tag className="h-8 w-8 text-primary" />
              Tags Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and organize tags for community discussions.
            </p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New Tag
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
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
                Failed to load tags. Please try again.
              </div>
            ) : filteredTags.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {search ? `No tags matching "${search}"` : "No tags created yet."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Slug</TableHead>
                    <TableHead className="hidden lg:table-cell">Usage</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <Badge 
                          style={{ 
                            backgroundColor: tag.color || '#6366f1',
                            color: '#fff' 
                          }}
                        >
                          {tag.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{tag.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {tag.slug}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="secondary">{tag.usage_count || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(tag)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
                                deleteMutation.mutate(tag.id)
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTag ? "Edit Tag" : "Create New Tag"}</DialogTitle>
              <DialogDescription>
                Tags help organize forum discussions. They have a name, color, and optional description.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tag Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Technology"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Tag Color</Label>
                <div className="flex gap-3">
                  <Input
                    id="color"
                    type="color"
                    className="w-12 h-10 p-1"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                  <Input
                    id="color-text"
                    placeholder="#000000"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1"
                    pattern="^#[A-Fa-f0-9]{6}$"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What is this tag for?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={255}
                  rows={3}
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
                  {editingTag ? "Save Changes" : "Create Tag"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardShell>
  )
}
