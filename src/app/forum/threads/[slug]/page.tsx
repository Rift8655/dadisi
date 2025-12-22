"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  ArrowLeft,
  Pin,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Send,
  User,
  MoreVertical,
  MapPin,
} from "lucide-react"
import { useAuth } from "@/store/auth"
import {
  useForumThread,
  useForumPosts,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  usePinThread,
  useUnpinThread,
  useLockThread,
  useUnlockThread,
} from "@/hooks/useForum"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ForumSidebar } from "@/components/forum/ForumSidebar"
import Swal from "sweetalert2"

interface ThreadPageProps {
  params: Promise<{ slug: string }>
}

export default function ThreadPage({ params }: ThreadPageProps) {
  const { slug } = use(params)
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  const [replyContent, setReplyContent] = useState("")
  const [editingPostId, setEditingPostId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  const [deletePostId, setDeletePostId] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: thread, isLoading: threadLoading, error: threadError } = useForumThread(slug)
  const { data: postsData, isLoading: postsLoading } = useForumPosts(slug)

  const createPostMutation = useCreatePost()
  const updatePostMutation = useUpdatePost()
  const deletePostMutation = useDeletePost()
  const pinMutation = usePinThread()
  const unpinMutation = useUnpinThread()
  const lockMutation = useLockThread()
  const unlockMutation = useUnlockThread()

  const handleReply = async () => {
    if (!replyContent.trim()) return

    try {
      await createPostMutation.mutateAsync({
        threadSlug: slug,
        data: { content: replyContent },
      })
      setReplyContent("")
      Swal.fire({
        icon: "success",
        title: "Reply posted!",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed to post reply", "error")
    }
  }

  const handleUpdatePost = async (postId: number) => {
    if (!editContent.trim()) return

    try {
      await updatePostMutation.mutateAsync({
        id: postId,
        data: { content: editContent },
      })
      setEditingPostId(null)
      setEditContent("")
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed to update post", "error")
    }
  }

  const canModerate = user?.roles?.some((r: { name: string }) =>
    ["admin", "super_admin", "moderator"].includes(r.name)
  )

  if (threadLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex gap-8">
          <ForumSidebar className="hidden lg:block" />
          <div className="flex-1 min-w-0 max-w-4xl">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-32 rounded-lg mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (threadError || !thread) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex gap-8">
          <ForumSidebar className="hidden lg:block" />
          <div className="flex-1 min-w-0">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <p className="text-destructive">Thread not found or failed to load.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex gap-8">
        {/* Sidebar */}
        <ForumSidebar className="hidden lg:block" />

        {/* Main Content */}
        <main className="flex-1 min-w-0 max-w-4xl">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/forum/${thread.category?.slug || ""}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to {thread.category?.name || "Forum"}
          </Button>

          {/* Thread Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {thread.is_pinned && (
                      <Badge variant="warning">
                        <Pin className="h-3 w-3 mr-1" /> Pinned
                      </Badge>
                    )}
                    {thread.is_locked && (
                      <Badge variant="secondary">
                        <Lock className="h-3 w-3 mr-1" /> Locked
                      </Badge>
                    )}
                    {thread.county && (
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        <MapPin className="h-3 w-3 mr-1" /> {thread.county.name}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl md:text-2xl">{thread.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={thread.user?.profile_picture_path || "/images/default-avatar.png"} />
                      <AvatarFallback>
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">
                      {thread.user?.username || "Unknown"}
                    </span>
                    <span>•</span>
                    <span>
                      {thread.created_at
                        ? format(new Date(thread.created_at), "MMM d, yyyy")
                        : "Unknown date"}
                    </span>
                  </div>
                </div>

                {canModerate && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          thread.is_pinned
                            ? unpinMutation.mutate(slug)
                            : pinMutation.mutate(slug)
                        }
                      >
                        <Pin className="h-4 w-4 mr-2" />
                        {thread.is_pinned ? "Unpin" : "Pin"} Thread
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          thread.is_locked
                            ? unlockMutation.mutate(slug)
                            : lockMutation.mutate(slug)
                        }
                      >
                        {thread.is_locked ? (
                          <>
                            <Unlock className="h-4 w-4 mr-2" /> Unlock Thread
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" /> Lock Thread
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Posts */}
          <div className="space-y-4">
            {postsLoading ? (
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))
            ) : (
              postsData?.data?.map((post: any, index: number) => {
                const isAuthor = user?.id === post.user_id
                const isEditing = editingPostId === post.id

                return (
                  <Card key={post.id} id={`post-${post.id}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.user?.profile_picture_path || "/images/default-avatar.png"} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {post.user?.username || "Unknown"}
                              </span>
                              {index === 0 && (
                                <Badge variant="default" className="text-[10px] h-4 px-1.5">
                                  OP
                                </Badge>
                              )}
                              {post.is_edited && (
                                <span className="text-xs text-muted-foreground">(edited)</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {post.created_at
                                  ? format(new Date(post.created_at), "MMM d, HH:mm")
                                  : ""}
                              </span>

                              {(isAuthor || canModerate) && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditingPostId(post.id)
                                        setEditContent(post.content)
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => setDeletePostId(post.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="mt-2 text-right">
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={4}
                                className="mb-2"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdatePost(post.id)}
                                  disabled={updatePostMutation.isPending}
                                >
                                  Save Change
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingPostId(null)
                                    setEditContent("")
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 prose prose-sm dark:prose-invert max-w-none">
                              <p className="whitespace-pre-wrap leading-relaxed">
                                {post.content}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* Reply Box */}
          {isAuthenticated && !thread.is_locked && (
            <Card className="mt-6 border-primary/20 shadow-md">
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profile_picture_url || "/images/default-avatar.png"} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={4}
                      className="mb-3 focus-visible:ring-primary"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleReply}
                        disabled={createPostMutation.isPending || !replyContent.trim()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {createPostMutation.isPending ? "Posting..." : "Post Reply"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!isAuthenticated && !thread.is_locked && (
            <div className="mt-6 text-center p-6 border-2 border-dashed rounded-lg bg-muted/30">
              <p className="text-muted-foreground mb-4">Please log in to join the conversation.</p>
              <Button onClick={() => router.push("/login")}>Log In</Button>
            </div>
          )}

          {thread.is_locked && (
            <Card className="mt-6 bg-muted/50 border-dashed">
              <CardContent className="py-8 text-center">
                <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground font-medium">
                  This thread is locked. No new replies can be added.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Delete Confirmation */}
          <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Post</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this post? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() =>
                    deletePostId && deletePostMutation.mutate(deletePostId)
                  }
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  )
}
