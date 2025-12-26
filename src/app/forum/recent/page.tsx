"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  Eye,
  Pin,
  Lock,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { forumApi } from "@/lib/api"
import { type ForumThread } from "@/schemas/forum"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ForumSidebar } from "@/components/forum/ForumSidebar"

export default function RecentPage() {
  const [page, setPage] = useState(1)
  const perPage = 15

  const { data, isLoading, error } = useQuery({
    queryKey: ["forum-threads-recent", page],
    queryFn: () => forumApi.threads.listAll({ page, per_page: perPage }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  const threads = data?.data ?? []
  const currentPage = data?.current_page ?? 1
  const lastPage = data?.last_page ?? 1

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex gap-8">
        <ForumSidebar className="hidden lg:block" />

        <main className="flex-1 min-w-0">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/forum">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Forum
            </Link>
          </Button>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Clock className="h-8 w-8 text-primary" />
                Recent Discussions
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Latest threads across all categories, sorted by most recent activity.
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="py-5">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-destructive bg-destructive/5">
                <CardContent className="py-8 text-center">
                  <p className="text-destructive">Failed to load threads. Please try again.</p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && threads.length === 0 && (
              <Card className="border-dashed border-2 bg-muted/30">
                <CardContent className="py-20 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Threads Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Be the first to start a discussion in the community!
                  </p>
                  <Button asChild>
                    <Link href="/forum">Browse Categories</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Thread List */}
            {!isLoading && threads.length > 0 && (
              <div className="space-y-4">
                {threads.map((thread: ForumThread) => (
                  <Link key={thread.id} href={`/forum/threads/${thread.slug}`}>
                    <Card className="hover:border-primary/50 transition-all cursor-pointer group hover:shadow-md">
                      <CardContent className="py-5">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                            <AvatarImage src={thread.user?.profile_picture_path || "/images/default-avatar.png"} />
                            <AvatarFallback className="bg-primary/5 text-primary">
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {thread.is_pinned && (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-1.5 py-0">
                                  <Pin className="h-3 w-3 mr-1" /> Pinned
                                </Badge>
                              )}
                              {thread.is_locked && (
                                <Badge variant="secondary" className="px-1.5 py-0">
                                  <Lock className="h-3 w-3 mr-1" /> Locked
                                </Badge>
                              )}
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                                {thread.title}
                              </h3>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                              <span className="font-medium text-foreground">
                                {thread.user?.username || "Unknown"}
                              </span>
                              <span>•</span>
                              {thread.category && (
                                <>
                                  <Badge variant="outline" className="text-xs">
                                    {thread.category.name}
                                  </Badge>
                                  <span>•</span>
                                </>
                              )}
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3.5 w-3.5" />
                                {thread.posts_count ?? thread.reply_count ?? 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                {thread.views_count ?? thread.view_count ?? 0}
                              </span>
                              <span>
                                {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && lastPage > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {lastPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                  disabled={currentPage >= lastPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
