"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { type ForumThread } from "@/schemas/forum"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  Hash,
  Lock,
  MessageSquare,
  Pin,
  User,
} from "lucide-react"

import { forumApi } from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ForumSidebar } from "@/components/forum/ForumSidebar"

export default function TagDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [page, setPage] = useState(1)
  const perPage = 15

  const { data, isLoading, error } = useQuery({
    queryKey: ["forum-tag", slug, page],
    queryFn: () => forumApi.tags.get(slug, { page, per_page: perPage }),
    enabled: !!slug,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Backend returns { success, data: { tag, threads } } - handle wrapper
  const responseData = (data as any)?.data
  const tag = responseData?.tag
  const threads = responseData?.threads?.data ?? []
  const currentPage = responseData?.threads?.current_page ?? 1
  const lastPage = responseData?.threads?.last_page ?? 1

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <ForumSidebar className="hidden lg:block" />

        <main className="min-w-0 flex-1">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/forum/tags">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tags
            </Link>
          </Button>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-96" />
              </div>
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
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="py-8 text-center">
                <p className="text-destructive">
                  Tag not found or failed to load.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/forum/tags">Browse Tags</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Content */}
          {!isLoading && !error && tag && (
            <div className="space-y-6">
              {/* Tag Header */}
              <div
                className="border-l-4 pl-4"
                style={{ borderLeftColor: tag.color || "#6366f1" }}
              >
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
                  <Hash
                    className="h-8 w-8"
                    style={{ color: tag.color || "#6366f1" }}
                  />
                  {tag.name}
                </h1>
                {tag.description && (
                  <p className="mt-2 text-lg text-muted-foreground">
                    {tag.description}
                  </p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">
                  {tag.usage_count || 0} threads tagged
                </p>
              </div>

              {/* Empty State */}
              {threads.length === 0 && (
                <Card className="border-2 border-dashed bg-muted/30">
                  <CardContent className="py-20 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">
                      No Threads Yet
                    </h3>
                    <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                      No discussions have been tagged with "{tag.name}" yet.
                    </p>
                    <Button asChild>
                      <Link href="/forum">Browse Categories</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Thread List */}
              {threads.length > 0 && (
                <div className="space-y-4">
                  {threads.map((thread: ForumThread) => (
                    <Link
                      key={thread.id}
                      href={`/forum/threads/${thread.slug}`}
                    >
                      <Card className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                        <CardContent className="py-5">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                              <AvatarImage
                                src={
                                  thread.user?.profile_picture_path ||
                                  "/images/default-avatar.png"
                                }
                              />
                              <AvatarFallback className="bg-primary/5 text-primary">
                                <User className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                {thread.is_pinned && (
                                  <Badge className="border-none bg-amber-100 px-1.5 py-0 text-amber-700 hover:bg-amber-100">
                                    <Pin className="mr-1 h-3 w-3" /> Pinned
                                  </Badge>
                                )}
                                {thread.is_locked && (
                                  <Badge
                                    variant="secondary"
                                    className="px-1.5 py-0"
                                  >
                                    <Lock className="mr-1 h-3 w-3" /> Locked
                                  </Badge>
                                )}
                                <h3 className="line-clamp-1 text-lg font-semibold transition-colors group-hover:text-primary">
                                  {thread.title}
                                </h3>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  {thread.user?.username || "Unknown"}
                                </span>
                                <span>•</span>
                                {thread.category && (
                                  <>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {thread.category.name}
                                    </Badge>
                                    <span>•</span>
                                  </>
                                )}
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  {thread.posts_count ??
                                    thread.reply_count ??
                                    0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3.5 w-3.5" />
                                  {thread.views_count ?? thread.view_count ?? 0}
                                </span>
                                <span>
                                  {formatDistanceToNow(
                                    new Date(thread.created_at),
                                    { addSuffix: true }
                                  )}
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
              {lastPage > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {lastPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    disabled={currentPage >= lastPage}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
