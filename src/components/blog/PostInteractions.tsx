"use client"

import { useAuth } from "@/store/auth"
import { MessageSquare, ThumbsDown, ThumbsUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { usePostLikeStatus, useToggleLike } from "@/hooks/usePostInteractions"
import { Button } from "@/components/ui/button"

interface PostInteractionsProps {
  slug: string
  likesCount?: number
  dislikesCount?: number
  commentsCount?: number
}

export function PostInteractions({
  slug,
  likesCount: initialLikes,
  dislikesCount: initialDislikes,
  commentsCount = 0,
}: PostInteractionsProps) {
  const { user } = useAuth()
  const { data: status, isLoading } = usePostLikeStatus(slug, !!user)
  const toggleLike = useToggleLike(slug)

  const likes = status ? status.likes_count : initialLikes || 0
  const dislikes = status ? status.dislikes_count : initialDislikes || 0
  const userVote = status?.user_vote

  const handleToggle = (type: "like" | "dislike") => {
    if (!user) {
      // In a real app, maybe open login modal
      return
    }
    toggleLike.mutate(type)
  }

  return (
    <div className="my-6 flex items-center gap-6 border-y py-4">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-2",
            userVote === "like" && "text-primary hover:text-primary"
          )}
          onClick={() => handleToggle("like")}
          disabled={!user || toggleLike.isPending}
        >
          <ThumbsUp
            className={cn("h-5 w-5", userVote === "like" && "fill-current")}
          />
          <span>{likes}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-2",
            userVote === "dislike" && "text-destructive hover:text-destructive"
          )}
          onClick={() => handleToggle("dislike")}
          disabled={!user || toggleLike.isPending}
        >
          <ThumbsDown
            className={cn("h-5 w-5", userVote === "dislike" && "fill-current")}
          />
          <span>{dislikes}</span>
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageSquare className="h-5 w-5" />
        <span>{commentsCount} Comments</span>
      </div>
    </div>
  )
}
