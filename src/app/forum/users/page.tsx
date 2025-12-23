"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowLeft,
  Users,
  Search,
  MessageSquare,
  FileText,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { forumApi, type ForumUser } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ForumSidebar } from "@/components/forum/ForumSidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("post_count")
  const [page, setPage] = useState(1)
  const perPage = 20

  const { data, isLoading, error } = useQuery({
    queryKey: ["forum-users", search, sortBy, page],
    queryFn: () => forumApi.users.list({ search: search || undefined, sort: sortBy, page, per_page: perPage }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const users = data?.data ?? []
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
                <Users className="h-8 w-8 text-primary" />
                Community Members
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Meet the members of our community.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post_count">Most Active</SelectItem>
                  <SelectItem value="joined_date">Recently Joined</SelectItem>
                  <SelectItem value="recent_activity">Recent Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="py-5">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-14 w-14 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
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
                  <p className="text-destructive">Failed to load members. Please try again.</p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && users.length === 0 && (
              <Card className="border-dashed border-2 bg-muted/30">
                <CardContent className="py-20 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Members Found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {search ? `No members matching "${search}".` : "No community members to display yet."}
                  </p>
                  {search && (
                    <Button variant="outline" onClick={() => setSearch("")}>
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Members Grid */}
            {!isLoading && users.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user: ForumUser) => (
                  <Link key={user.id} href={`/users/${user.username}`}>
                    <Card className="hover:border-primary/50 transition-all cursor-pointer group h-full">
                      <CardContent className="py-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                            <AvatarImage src={user.profile_picture_url || "/images/default-avatar.png"} />
                            <AvatarFallback className="bg-primary/5 text-primary">
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                              {user.username}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap mt-1">
                              <span className="flex items-center gap-1" title="Threads">
                                <FileText className="h-3.5 w-3.5" />
                                {user.thread_count}
                              </span>
                              <span className="flex items-center gap-1" title="Posts">
                                <MessageSquare className="h-3.5 w-3.5" />
                                {user.post_count}
                              </span>
                              <span className="flex items-center gap-1" title="Joined">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDistanceToNow(new Date(user.joined_at), { addSuffix: true })}
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
