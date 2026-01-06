"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Category, Tag, Post as UserPost } from "@/schemas/post"
import { useAuth } from "@/store/auth"
import {
  Eye,
  FileX,
  Heart,
  Loader2,
  Pencil,
  Plus,
  Send,
  Trash,
} from "lucide-react"
import Swal from "sweetalert2"

import { authorPostsApi } from "@/lib/api"
import { useMemberProfileQuery } from "@/hooks/useMemberProfileQuery"
import {
  useAuthorCategories,
  useAuthorPosts,
  useAuthorTags,
  useDeletePostMutation,
  usePublishPostMutation,
  useUnpublishPostMutation,
} from "@/hooks/usePosts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { LikersDialog } from "@/components/blog/LikersDialog"
import { UserDashboardShell } from "@/components/user-dashboard-shell"

export default function BlogPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"posts" | "categories" | "tags">(
    "posts"
  )
  const [page, setPage] = useState(1)
  const [likersSlug, setLikersSlug] = useState<string | null>(null)

  // Fetch data with TanStack Query
  const { data: profile, isLoading: profileLoading } = useMemberProfileQuery()

  const {
    data: postsResponse,
    isLoading: postsLoading,
    error: postsError,
  } = useAuthorPosts({ page })

  const { data: categories = [], isLoading: categoriesLoading } =
    useAuthorCategories()
  const { data: tags = [], isLoading: tagsLoading } = useAuthorTags()

  // Mutations
  const publishMutation = usePublishPostMutation()
  const unpublishMutation = useUnpublishPostMutation()
  const deleteMutation = useDeletePostMutation()

  const hasSubscription = !!profile?.plan_type && profile.plan_type !== "Free"
  const posts = (postsResponse as any)?.data || []
  const loading =
    profileLoading || postsLoading || categoriesLoading || tagsLoading
  const error = postsError ? (postsError as any).message : null

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-500/10 text-green-600">Published</Badge>
        )
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "archived":
        return <Badge variant="outline">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handlePublish = async (post: UserPost) => {
    const result = await Swal.fire({
      title: "Publish Post?",
      text: "This will make the post visible to the public.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Publish",
      confirmButtonColor: "#22c55e",
    })
    if (result.isConfirmed) {
      try {
        await publishMutation.mutateAsync(post.slug)
        Swal.fire("Published", "Post is now live.", "success")
      } catch (e: any) {
        Swal.fire("Error", e.message || "Failed to publish post", "error")
      }
    }
  }

  const handleUnpublish = async (post: UserPost) => {
    const result = await Swal.fire({
      title: "Unpublish Post?",
      text: "This will hide the post from the public.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Unpublish",
      confirmButtonColor: "#f59e0b",
    })
    if (result.isConfirmed) {
      try {
        await unpublishMutation.mutateAsync(post.slug)
        Swal.fire("Unpublished", "Post is now a draft.", "success")
      } catch (e: any) {
        Swal.fire("Error", e.message || "Failed to unpublish post", "error")
      }
    }
  }

  const handleDelete = async (post: UserPost) => {
    const result = await Swal.fire({
      title: "Delete Post?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#ef4444",
    })
    if (result.isConfirmed) {
      try {
        await deleteMutation.mutateAsync(post.slug)
        Swal.fire("Deleted", "Post has been deleted.", "success")
      } catch (e: any) {
        Swal.fire("Error", e.message || "Failed to delete post", "error")
      }
    }
  }

  // Subscription gate
  if (!hasSubscription) {
    return (
      <UserDashboardShell title="Blog">
        <Card className="mx-auto mt-12 max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <CardTitle>Premium Feature</CardTitle>
            <CardDescription>
              Creating and managing blog posts is a premium feature. Upgrade
              your subscription to unlock blogging capabilities.
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
    <UserDashboardShell title="Blog">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-medium">Manage Your Content</h2>
            <p className="text-sm text-muted-foreground">
              Create, edit, and manage your blog posts, categories, and tags.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/blog/create">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {(["posts", "categories", "tags"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "posts" && (
          <Card>
            <CardHeader>
              <CardTitle>Your Posts</CardTitle>
              <CardDescription>
                {posts.length} post{posts.length !== 1 ? "s" : ""} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={posts}
                columns={[
                  {
                    key: "title",
                    header: "Title",
                    cell: (post: UserPost) => (
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{post.title}</h4>
                          {getStatusBadge(post.status || "draft")}
                        </div>
                        <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "views",
                    header: "Engagement",
                    cell: (post: UserPost) => (
                      <div
                        className="flex cursor-pointer items-center gap-3 rounded p-1 text-xs transition-colors hover:bg-muted/50"
                        title="View Interactions"
                        onClick={() => setLikersSlug(post.slug)}
                      >
                        <div className="flex items-center gap-1 text-primary">
                          <Heart className="h-3 w-3 fill-current" />
                          <span>{post.likes_count || 0}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {post.views_count} views
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "comments",
                    header: "Comments",
                    cell: (post: UserPost) => post.comments_count,
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    className: "text-right",
                    cell: (post: UserPost) => (
                      <div className="flex justify-end gap-1">
                        {post.status === "published" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Unpublish"
                            onClick={() => handleUnpublish(post)}
                            className="text-amber-500 hover:bg-amber-50"
                          >
                            <FileX className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Publish"
                            onClick={() => handlePublish(post)}
                            className="text-green-500 hover:bg-green-50"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View Likers"
                          onClick={() => setLikersSlug(post.slug)}
                          className="text-rose-500 hover:bg-rose-50"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View"
                          asChild
                        >
                          <Link href={`/blog/${post.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit"
                          asChild
                        >
                          <Link href={`/dashboard/blog/${post.slug}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          onClick={() => handleDelete(post)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
                loading={loading}
                pageSize={10}
                pageSizeOptions={[5, 10, 20, 50]}
                emptyMessage="No posts yet. Create your first post!"
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "categories" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Organize your posts with categories
                </CardDescription>
              </div>
              <Button size="sm" variant="outline">
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              {categories.length > 0 ? (
                <div className="divide-y">
                  {categories.map((category: Category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <span className="font-medium">{category.name}</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-muted-foreground">
                  No categories yet
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "tags" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Label your posts with tags</CardDescription>
              </div>
              <Button size="sm" variant="outline">
                Add Tag
              </Button>
            </CardHeader>
            <CardContent>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: Tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                    >
                      {tag.name}
                      <button className="ml-1 text-muted-foreground hover:text-destructive">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-muted-foreground">
                  No tags yet
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <LikersDialog
        slug={likersSlug || ""}
        isOpen={!!likersSlug}
        onClose={() => setLikersSlug(null)}
      />
    </UserDashboardShell>
  )
}
