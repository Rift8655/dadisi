"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Swal from "sweetalert2"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/icons"
import { blogApi } from "@/lib/api-admin"
import { Save, Send, Trash2, ArrowLeft, Eye } from "lucide-react"
import { DevEditor } from "./DevEditor"
import { FeaturedImageUpload } from "./FeaturedImageUpload"
import { TaxonomySelector } from "./TaxonomySelector"
import { authorBlogApi, authorPostsApi } from "@/lib/api"

// Check if we should use dev editor (for local development without TinyMCE domain registration)
const USE_DEV_EDITOR = process.env.NEXT_PUBLIC_USE_DEV_EDITOR === "true"

// TinyMCE loaded dynamically to avoid SSR issues (only if not using dev editor)
const TinyMCEEditor = dynamic<any>(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor as any),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-muted rounded" /> }
)

interface PostFormData {
  title: string
  slug: string
  excerpt: string
  body: string
  hero_image_path: string
  meta_title: string
  meta_description: string
  county_id: number | null
  category_ids: number[]
  tag_ids: number[]
  status: "draft" | "published"
  is_featured: boolean
}

interface PostEditorProps {
  mode: "create" | "edit"
  postSlug?: string
  dashboardType: "admin" | "user"
  onSuccess?: () => void
}

const defaultFormData: PostFormData = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  hero_image_path: "",
  meta_title: "",
  meta_description: "",
  county_id: null,
  category_ids: [],
  tag_ids: [],
  status: "draft",
  is_featured: false,
}

export function PostEditor({ mode, postSlug, dashboardType, onSuccess }: PostEditorProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<PostFormData>(defaultFormData)
  const [currentSlug, setCurrentSlug] = useState<string | undefined>(postSlug)
  const [saving, setSaving] = useState(false)
  const editorRef = useRef<any>(null)

  // Fetch post data if editing by slug
  const { data: postData, isLoading: postLoading } = useQuery({
    queryKey: ["post", postSlug],
    queryFn: async () => {
      if (!postSlug) return null
      if (dashboardType === "admin") {
        return blogApi.posts.get(postSlug)
      } else {
        return authorPostsApi.get(postSlug)
      }
    },
    enabled: mode === "edit" && !!postSlug,
  })

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: [dashboardType, "categories"],
    queryFn: () => {
      if (dashboardType === "admin") {
        return blogApi.categories.list()
      } else {
        return authorBlogApi.categories.list()
      }
    },
  })

  // Fetch tags
  const { data: tagsData, isLoading: tagsLoading } = useQuery({
    queryKey: [dashboardType, "tags"],
    queryFn: () => {
      if (dashboardType === "admin") {
        return blogApi.tags.list()
      } else {
        return authorBlogApi.tags.list()
      }
    },
  })

  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.data || []
  const tags = Array.isArray(tagsData) ? tagsData : tagsData?.data || []

  // Populate form when post data loads
  useEffect(() => {
    if (postData && mode === "edit") {
      // Track the current slug for updates
      if (postData.slug) {
        setCurrentSlug(postData.slug)
      }
      setFormData({
        title: postData.title || "",
        slug: postData.slug || "",
        excerpt: postData.excerpt || "",
        body: postData.body || "",
        hero_image_path: postData.hero_image_path || "",
        meta_title: postData.meta_title || "",
        meta_description: postData.meta_description || "",
        county_id: postData.county_id || null,
        category_ids: postData.categories?.map((c: any) => c.id) || [],
        tag_ids: postData.tags?.map((t: any) => t.id) || [],
        status: postData.status || "draft",
        is_featured: postData.is_featured || false,
      })
    }
  }, [postData, mode])

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
    setFormData((prev) => ({ ...prev, title, slug }))
  }

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: PostFormData & { publish?: boolean }) => {
      const payload = {
        ...data,
        status: data.publish ? "published" : data.status,
        published_at: data.publish ? new Date().toISOString() : null,
      }

      if (mode === "create") {
        return dashboardType === "admin" 
          ? blogApi.posts.create(payload) 
          : authorPostsApi.create(payload)
      } else {
        return dashboardType === "admin"
          ? blogApi.posts.update(currentSlug!, payload)
          : authorPostsApi.update(currentSlug!, payload)
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [dashboardType, "posts"] })
      const action = variables.publish ? "published" : mode === "create" ? "created" : "updated"
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Post ${action} successfully!`,
        timer: 2000,
      })
      onSuccess?.()
      router.push(dashboardType === "admin" ? "/admin/blog" : "/dashboard/blog")
    },
    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to save post",
      })
    },
  })

  // Category creation mutation
  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => {
      if (dashboardType === "admin") {
        return blogApi.categories.create({ name })
      } else {
        return authorBlogApi.categories.create({ name })
      }
    },
    onSuccess: (newCategory: any) => {
      queryClient.invalidateQueries({ queryKey: [dashboardType, "categories"] })
      
      // Auto-select the newly created category
      const categoryId = newCategory.data?.id || newCategory.id
      if (categoryId) {
        setFormData(prev => ({
          ...prev,
          category_ids: [...prev.category_ids, categoryId]
        }))
      } else {
        console.error("Failed to extract category ID from response:", newCategory)
        Swal.fire("Error", "Category created but ID not found. Please refresh.", "error")
      }
      
      Swal.fire({
        icon: "success",
        title: "Category Created",
        text: `"${newCategory.data?.name || newCategory.name}" has been created.`,
        timer: 1500,
        showConfirmButton: false,
      })
    },
    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to create category",
      })
    },
  })

  // Tag creation mutation
  const createTagMutation = useMutation({
    mutationFn: (name: string) => {
      if (dashboardType === "admin") {
        return blogApi.tags.create({ name })
      } else {
        return authorBlogApi.tags.create({ name })
      }
    },
    onSuccess: (newTag: any) => {
      queryClient.invalidateQueries({ queryKey: [dashboardType, "tags"] })
      
      // Auto-select the newly created tag
      const tagId = newTag.data?.id || newTag.id
      if (tagId) {
        setFormData(prev => ({
          ...prev,
          tag_ids: [...prev.tag_ids, tagId]
        }))
      } else {
        console.error("Failed to extract tag ID from response:", newTag)
        Swal.fire("Error", "Tag created but ID not found. Please refresh.", "error")
      }

      Swal.fire({
        icon: "success",
        title: "Tag Created",
        text: `"${newTag.data?.name || newTag.name}" has been created.`,
        timer: 1500,
        showConfirmButton: false,
      })
    },
    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to create tag",
      })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (dashboardType === "admin") {
        return blogApi.posts.delete(currentSlug!)
      } else {
        return authorPostsApi.delete(currentSlug!)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [dashboardType, "posts"] })
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Post moved to trash.",
        timer: 2000,
      })
      router.push(dashboardType === "admin" ? "/admin/blog" : "/dashboard/blog")
    },
    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to delete post",
      })
    },
  })

  const handleSaveDraft = () => {
    saveMutation.mutate({ ...formData, status: "draft" })
  }

  const handlePublish = () => {
    if (!formData.title.trim()) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Title is required" })
      return
    }
    if (!formData.body.trim()) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Content is required" })
      return
    }
    saveMutation.mutate({ ...formData, publish: true })
  }

  const handleDelete = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Post?",
      text: "This will move the post to trash.",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete",
    })
    if (result.isConfirmed) {
      deleteMutation.mutate()
    }
  }

  const toggleCategory = (categoryId: number) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter((id) => id !== categoryId)
        : [...prev.category_ids, categoryId],
    }))
  }

  const toggleTag = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId],
    }))
  }

  const backUrl = dashboardType === "admin" ? "/admin/blog" : "/dashboard/blog"

  if (mode === "edit" && postLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(backUrl)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {mode === "create" ? "Create New Post" : "Edit Post"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "create"
                ? "Write your new blog post"
                : `Editing: ${formData.title || "Untitled"}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={saveMutation.isPending}
          >
            <Save className="h-4 w-4 mr-1" />
            Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={saveMutation.isPending}>
            <Send className="h-4 w-4 mr-1" />
            {formData.status === "published" ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                  className="text-lg font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="post-url-slug"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief description of the post..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              {USE_DEV_EDITOR ? (
                <DevEditor
                  value={formData.body}
                  onChange={(content) => setFormData({ ...formData, body: content })}
                  height={500}
                />
              ) : (
                <TinyMCEEditor
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
                  onInit={(evt: any, editor: any) => (editorRef.current = editor)}
                  value={formData.body}
                  onEditorChange={(content: string) => setFormData({ ...formData, body: content })}
                  init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                      "advlist", "autolink", "lists", "link", "image", "charmap",
                      "preview", "anchor", "searchreplace", "visualblocks", "code",
                      "fullscreen", "insertdatetime", "media", "table", "help", "wordcount"
                    ],
                    toolbar:
                      "undo redo | blocks | bold italic forecolor | alignleft aligncenter " +
                      "alignright alignjustify | bullist numlist outdent indent | " +
                      "removeformat | link image | help",
                    content_style: "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 16px; }",
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder="SEO title (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="SEO description (optional)"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {formData.status === "published" ? (
                  <Badge className="bg-green-500">Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <FeaturedImageUpload
            value={formData.hero_image_path}
            onChange={(path) => setFormData({ ...formData, hero_image_path: path })}
          />

          {/* Categories */}
          <Card>
            <CardContent className="pt-6">
              <TaxonomySelector
                title="Categories"
                type="category"
                items={categories}
                selectedIds={formData.category_ids}
                onToggle={toggleCategory}
                onCreate={async (name) => {
                   await createCategoryMutation.mutateAsync(name)
                }}
                loading={categoriesLoading}
                creating={createCategoryMutation.isPending}
                placeholder="Search or add category..."
              />
            </CardContent>
          </Card>
 
          {/* Tags */}
          <Card>
            <CardContent className="pt-6">
              <TaxonomySelector
                title="Tags"
                type="tag"
                items={tags}
                selectedIds={formData.tag_ids}
                onToggle={toggleTag}
                onCreate={async (name) => {
                   await createTagMutation.mutateAsync(name)
                }}
                loading={tagsLoading}
                creating={createTagMutation.isPending}
                placeholder="Search or add tag..."
              />
            </CardContent>
          </Card>

          {/* Featured */}
          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Featured post</span>
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
