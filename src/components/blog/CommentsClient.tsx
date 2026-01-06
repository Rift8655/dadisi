"use client"

import { useState } from "react"
import { useAuth } from "@/store/auth"
import { MessageSquare, Trash2, User } from "lucide-react"

import { formatDate } from "@/lib/utils"
import {
  useCreateComment,
  useDeleteComment,
  usePostComments,
} from "@/hooks/usePostInteractions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface CommentsClientProps {
  slug: string
  allowComments?: boolean
}

export function CommentsClient({
  slug,
  allowComments = true,
}: CommentsClientProps) {
  const { user } = useAuth()
  const { data, isLoading } = usePostComments(slug)
  const createComment = useCreateComment(slug)
  const deleteComment = useDeleteComment(slug)

  const [commentBody, setCommentBody] = useState("")
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyBody, setReplyBody] = useState("")

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentBody.trim()) return

    await createComment.mutateAsync({ body: commentBody })
    setCommentBody("")
  }

  const handleSubmitReply = async (parentId: number) => {
    if (!replyBody.trim()) return

    await createComment.mutateAsync({ body: replyBody, parentId })
    setReplyBody("")
    setReplyingTo(null)
  }

  const handleDelete = async (commentId: number) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      await deleteComment.mutateAsync(commentId)
    }
  }

  if (!allowComments) {
    return (
      <div className="mt-10 border-t pt-10 text-center text-muted-foreground">
        Comments are disabled for this post.
      </div>
    )
  }

  const comments = data?.data || []

  return (
    <div className="mt-10 border-t pt-10">
      <h3 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <MessageSquare className="h-6 w-6" />
        Comments ({data?.total || 0})
      </h3>

      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <Textarea
            placeholder="Write a comment..."
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            className="mb-2"
          />
          <Button disabled={createComment.isPending || !commentBody.trim()}>
            {createComment.isPending ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      ) : (
        <div className="mb-8 rounded-md bg-muted p-4 text-center text-sm">
          Please log in to leave a comment.
        </div>
      )}

      {isLoading ? (
        <div>Loading comments...</div>
      ) : (
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment: any) => (
              <div key={comment.id} className="space-y-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage
                      src={
                        comment.user.profile_picture_path ||
                        "/images/default-avatar.png"
                      }
                    />
                    <AvatarFallback>
                      <img
                        src="/images/default-avatar.png"
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">
                        {comment.user.username}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{comment.body}</p>
                    <div className="mt-2 flex items-center gap-4">
                      {user && (
                        <button
                          onClick={() =>
                            setReplyingTo(
                              replyingTo === comment.id ? null : comment.id
                            )
                          }
                          className="text-xs text-primary hover:underline"
                        >
                          Reply
                        </button>
                      )}
                      {(user?.id === comment.user.id ||
                        user?.role === "super_admin") && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="flex items-center gap-1 text-xs text-destructive hover:underline"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      )}
                    </div>

                    {replyingTo === comment.id && (
                      <div className="mt-4 space-y-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={
                              createComment.isPending || !replyBody.trim()
                            }
                          >
                            Post Reply
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setReplyingTo(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-8 mt-4 space-y-4 border-l pl-4">
                        {comment.replies.map((reply: any) => (
                          <div key={reply.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={
                                  reply.user.profile_picture_path ||
                                  "/images/default-avatar.png"
                                }
                              />
                              <AvatarFallback>
                                <img
                                  src="/images/default-avatar.png"
                                  alt="Avatar"
                                  className="h-full w-full object-cover"
                                />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-medium">
                                  {reply.user.username}
                                </h5>
                                <span className="text-[10px] text-muted-foreground">
                                  {formatDate(reply.created_at)}
                                </span>
                              </div>
                              <p className="mt-1 text-xs">{reply.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
