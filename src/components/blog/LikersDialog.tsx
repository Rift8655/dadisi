"use client"

import { ThumbsDown, ThumbsUp, User } from "lucide-react"

import { usePostLikers } from "@/hooks/usePostInteractions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LikersDialogProps {
  slug: string
  isOpen: boolean
  onClose: () => void
}

export function LikersDialog({ slug, isOpen, onClose }: LikersDialogProps) {
  const { data, isLoading } = usePostLikers(slug)

  const likers = data || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Post Interactions</DialogTitle>
          <DialogDescription>
            List of users who liked or disliked this post.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading likers...
            </div>
          ) : likers.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No interactions yet.
            </div>
          ) : (
            <div className="space-y-4">
              {likers.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          item.user.profile_picture_path ||
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
                    <span className="text-sm font-medium">
                      {item.user.username}
                    </span>
                  </div>
                  {item.type === "like" ? (
                    <Badge
                      variant="default"
                      className="gap-1 bg-green-500 hover:bg-green-600"
                    >
                      <ThumbsUp className="h-3 w-3" /> Like
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <ThumbsDown className="h-3 w-3" /> Dislike
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
