"use client"

import { useEffect, useState } from "react"
import { useAdmin } from "@/store/admin"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Icons } from "@/components/icons"
import { formatDate } from "@/lib/utils"
import Swal from "sweetalert2"
import { Eye, Pencil, Trash, ArchiveRestore, Ban, Plus } from "lucide-react"
import Link from "next/link"
import { AdminPost } from "@/types/admin"

export default function AdminBlogPage() {
  const { 
    posts, 
    postsLoading, 
    fetchPosts,
    deletePost,
    restorePost,
    forceDeletePost 
  } = useAdmin()

  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchPosts({ status: activeTab === 'all' ? undefined : activeTab })
  }, [fetchPosts, activeTab])

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
        await deletePost((post as { id?: number }).id as number)
        Swal.fire("Trashed", "Post moved to trash.", "success")
      } catch (e: unknown) {
        Swal.fire("Error", "Failed to trash post", "error")
      }
    }
  }

  const handleRestore = async (post: AdminPost) => {
    try {
      await restorePost(post.id)
      Swal.fire("Restored", "Post has been restored.", "success")
    } catch (e: unknown) {
      Swal.fire("Error", "Failed to restore post", "error")
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
        await forceDeletePost(post.id)
        Swal.fire("Deleted", "Post permanently deleted.", "success")
      } catch (e: unknown) {
        Swal.fire("Error", "Failed to delete post", "error")
      }
    }
  }

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

        <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
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
                  {postsLoading ? (
                    <div className="flex justify-center p-8">
                       <Icons.spinner className="h-8 w-8 animate-spin" />
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No posts found in this view.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {posts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell className="font-medium">
                              {post.title}
                              {post.deleted_at && <Badge variant="destructive" className="ml-2 text-[10px]">Deleted</Badge>}
                            </TableCell>
                            <TableCell>{post.author?.username || "Unknown"}</TableCell>
                            <TableCell>
                               {post.published_at ? (
                                 <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>
                               ) : (
                                 <Badge variant="secondary">Draft</Badge>
                               )}
                            </TableCell>
                            <TableCell>{formatDate(post.created_at)}</TableCell>
                            <TableCell className="text-right">
                               <div className="flex justify-end gap-2">
                                   {activeTab === 'trashed' || post.deleted_at ? (
                                    <>
                                      <Button variant="outline" size="sm" onClick={() => handleRestore(post)}>
                                        <ArchiveRestore className="w-4 h-4 mr-1" /> Restore
                                      </Button>
                                      <Button variant="destructive" size="sm" onClick={() => handleForceDelete(post)}>
                                        <Ban className="w-4 h-4 mr-1" /> Delete Forever
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Link href={`/blog/${post.slug}`} target="_blank">
                                        <Button variant="ghost" size="icon">
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                      </Link>
                                      <Link href={`/admin/blog/${post.id}/edit`}>
                                        <Button variant="ghost" size="icon">
                                          <Pencil className="w-4 h-4" />
                                        </Button>
                                      </Link>
                                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(post)}>
                                        <Trash className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
                               </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardShell>
  )
}
