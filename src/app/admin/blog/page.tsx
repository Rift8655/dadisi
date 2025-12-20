"use client"

import { useAdminUI } from "@/store/adminUI"
import { 
  useAdminPosts, 
  useAdminPublishPost, 
  useAdminUnpublishPost, 
  useAdminDeletePost, 
  useAdminRestorePost, 
  useAdminForceDeletePost 
} from "@/hooks/useAdminBlog"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Icons } from "@/components/icons"
import { formatDate } from "@/lib/utils"
import Swal from "sweetalert2"
import { Eye, Pencil, Trash, ArchiveRestore, Ban, Send, FileX, Loader2 } from "lucide-react"
import Link from "next/link"
import { AdminPost } from "@/types/admin"

export default function AdminBlogPage() {
  const { filters, setBlogStatusFilter } = useAdminUI()
  const activeTab = filters.blogStatusFilter

  const { data: postsData, isLoading: postsLoading } = useAdminPosts({ 
    status: activeTab === 'all' ? undefined : activeTab 
  })
  
  // Handle both paginated and array responses
  const posts = Array.isArray(postsData) ? postsData : (postsData as any)?.data || []

  const publishMutation = useAdminPublishPost()
  const unpublishMutation = useAdminUnpublishPost()
  const deleteMutation = useAdminDeletePost()
  const restoreMutation = useAdminRestorePost()
  const forceDeleteMutation = useAdminForceDeletePost()

  const handleDelete = async (post: AdminPost) => {
    const result = await Swal.fire({
      title: "Move to Trash?",
      text: "You can restore this post later from the Trash.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Trash It",
      confirmButtonColor: "#f59e0b"
    })

    if (result.isConfirmed) {
      try {
        await deleteMutation.mutateAsync(post.slug)
        Swal.fire("Trashed", "Post moved to trash.", "success")
      } catch (e: unknown) {
        Swal.fire("Error", e instanceof Error ? e.message : "Failed to trash post", "error")
      }
    }
  }

  const handleRestore = async (post: AdminPost) => {
    try {
      await restoreMutation.mutateAsync(post.slug)
      Swal.fire("Restored", "Post has been restored.", "success")
    } catch (e: unknown) {
      Swal.fire("Error", e instanceof Error ? e.message : "Failed to restore post", "error")
    }
  }

  const handleForceDelete = async (post: AdminPost) => {
    const result = await Swal.fire({
      title: "Permanently Delete?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete Forever",
      confirmButtonColor: "#ef4444"
    })

    if (result.isConfirmed) {
      try {
        await forceDeleteMutation.mutateAsync(post.slug)
        Swal.fire("Deleted", "Post permanently deleted.", "success")
      } catch (e: unknown) {
        Swal.fire("Error", e instanceof Error ? e.message : "Failed to delete post", "error")
      }
    }
  }

  const handlePublish = async (post: AdminPost) => {
    const result = await Swal.fire({
      title: "Publish Post?",
      text: "This will make the post visible to the public.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Publish",
      confirmButtonColor: "#22c55e"
    })

    if (result.isConfirmed) {
      try {
        await publishMutation.mutateAsync(post.slug)
        Swal.fire("Published", "Post is now live.", "success")
      } catch (e: unknown) {
        Swal.fire("Error", e instanceof Error ? e.message : "Failed to publish post", "error")
      }
    }
  }

  const handleUnpublish = async (post: AdminPost) => {
    const result = await Swal.fire({
      title: "Unpublish Post?",
      text: "This will hide the post from the public.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Unpublish",
      confirmButtonColor: "#f59e0b"
    })

    if (result.isConfirmed) {
      try {
        await unpublishMutation.mutateAsync(post.slug)
        Swal.fire("Unpublished", "Post is now a draft.", "success")
      } catch (e: unknown) {
        Swal.fire("Error", e instanceof Error ? e.message : "Failed to unpublish post", "error")
      }
    }
  }

  const columns = [
    {
      key: "title",
      header: "Title",
      cell: (post: AdminPost) => (
        <div className="font-medium">
          {post.title}
          {post.deleted_at && <Badge variant="destructive" className="ml-2 text-[10px]">Deleted</Badge>}
        </div>
      ),
    },
    {
      key: "author",
      header: "Author",
      cell: (post: AdminPost) => post.author?.username || "Unknown",
    },
    {
      key: "status",
      header: "Status",
      cell: (post: AdminPost) => (
        post.published_at ? (
          <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>
        ) : (
          <Badge variant="secondary">Draft</Badge>
        )
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (post: AdminPost) => formatDate(post.created_at),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (post: AdminPost) => {
        const isPublishing = publishMutation.isPending && publishMutation.variables === post.slug
        const isUnpublishing = unpublishMutation.isPending && unpublishMutation.variables === post.slug
        const isDeleting = deleteMutation.isPending && deleteMutation.variables === post.slug
        const isRestoring = restoreMutation.isPending && restoreMutation.variables === post.slug
        const isForceDeleting = forceDeleteMutation.isPending && forceDeleteMutation.variables === post.slug
        const anyPending = isPublishing || isUnpublishing || isDeleting || isRestoring || isForceDeleting

        return (
          <div className="flex justify-end gap-1">
            {activeTab === 'trashed' || post.deleted_at ? (
              <>
                <Button variant="outline" size="sm" onClick={() => handleRestore(post)} disabled={anyPending}>
                  {isRestoring ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ArchiveRestore className="w-4 h-4 mr-1" />}
                  Restore
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleForceDelete(post)} disabled={anyPending}>
                  {isForceDeleting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Ban className="w-4 h-4 mr-1" />}
                  Delete Forever
                </Button>
              </>
            ) : (
              <>
                {post.published_at ? (
                  <Button variant="ghost" size="icon" title="Unpublish" onClick={() => handleUnpublish(post)} className="text-amber-500 hover:bg-amber-50" disabled={anyPending}>
                    {isUnpublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileX className="w-4 h-4" />}
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" title="Publish" onClick={() => handlePublish(post)} className="text-green-500 hover:bg-green-50" disabled={anyPending}>
                    {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                )}
                <Link href={`/blog/${post.slug}`} target="_blank">
                  <Button variant="ghost" size="icon" title="View" disabled={anyPending}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={`/admin/blog/${post.slug}/edit`}>
                  <Button variant="ghost" size="icon" title="Edit" disabled={anyPending}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" title="Delete" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(post)} disabled={anyPending}>
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                </Button>
              </>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <AdminDashboardShell title="Blog Management">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Posts</h2>
              <p className="text-muted-foreground">
                Manage blog content, including restoration of deleted posts.
              </p>
            </div>
            <Link href="/admin/blog/create">
              <Button>
                <Icons.add className="mr-2 h-4 w-4" /> Create Post
              </Button>
            </Link>
        </div>

        <Tabs value={activeTab} className="space-y-4" onValueChange={(v) => setBlogStatusFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="trashed">Trash</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
             <Card>
                <CardHeader>
                  <CardTitle>Post List</CardTitle>
                  <CardDescription>
                    {activeTab === 'trashed' 
                      ? "Deleted posts that can be restored." 
                      : "Manage your blog posts."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={posts as any[]}
                    columns={columns as any[]}
                    loading={postsLoading}
                    pageSize={10}
                    pageSizeOptions={[5, 10, 20, 50]}
                    emptyMessage="No posts found in this view."
                  />
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardShell>
  )
}
