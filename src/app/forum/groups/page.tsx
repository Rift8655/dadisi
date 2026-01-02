"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { type Group } from "@/schemas/forum"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageSquare,
  SearchX,
  Users,
} from "lucide-react"

import { groupsApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ForumSidebar } from "@/components/forum/ForumSidebar"

export default function GroupsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [perPage, setPerPage] = useState(15)
  const mainRef = useRef<HTMLElement>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ["forum-groups", page, search, sortBy, perPage],
    queryFn: () =>
      groupsApi.list({
        page,
        per_page: perPage,
        search: search || undefined,
        sort: sortBy,
        order: sortBy === "name" ? "asc" : "desc",
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const groups = (data as any)?.data ?? []
  const total = (data as any)?.meta?.total ?? 0
  const totalPages = Math.ceil(total / perPage)

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
    mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <ForumSidebar className="hidden lg:block" />

        <main ref={mainRef} className="min-w-0 flex-1">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/forum">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forum
            </Link>
          </Button>

          <div className="space-y-6">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
                <Users className="h-8 w-8 text-primary" />
                Groups
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Connect with community members in your county. Join discussions,
                share ideas, and build local networks.
              </p>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search groups..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="h-10"
                />
              </div>
              <Select
                value={sortBy}
                onValueChange={(v) => {
                  setSortBy(v)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="member_count">Most Members</SelectItem>
                  <SelectItem value="thread_count">Most Discussions</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={String(perPage)}
                onValueChange={(v) => {
                  setPerPage(Number(v))
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="15">15 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="py-5">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-12 w-12 flex-shrink-0 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-1/3" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
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
                  <p className="text-destructive">
                    Failed to load groups. Please try again.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && groups.length === 0 && (
              <Card className="border-2 border-dashed bg-muted/30">
                <CardContent className="py-20 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <SearchX className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">
                    {search ? "No groups found" : "No groups yet"}
                  </h3>
                  <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                    {search
                      ? "Try adjusting your search terms"
                      : "Groups will be available soon. Check back later!"}
                  </p>
                  {search && (
                    <Button variant="outline" onClick={() => setSearch("")}>
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Groups Grid */}
            {!isLoading && groups.length > 0 && (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                  {groups.map((group: Group) => (
                    <Link key={group.id} href={`/forum/groups/${group.slug}`}>
                      <Card className="group h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                        <CardContent className="py-5">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-background shadow-sm">
                              <AvatarImage
                                src={
                                  group.image_path ||
                                  "/images/default-avatar.png"
                                }
                                alt={group.name}
                              />
                              <AvatarFallback className="bg-primary/5 text-primary">
                                <MapPin className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-1 text-lg font-semibold transition-colors group-hover:text-primary">
                                {group.name}
                              </h3>

                              {group.description && (
                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                  {group.description}
                                </p>
                              )}

                              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>
                                  {group.member_count}{" "}
                                  {group.member_count === 1
                                    ? "member"
                                    : "members"}
                                </span>
                                <span>•</span>
                                <MessageSquare className="h-4 w-4" />
                                <span>
                                  {group.thread_count ?? 0} discussions
                                </span>
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                className={cn(
                                  "opacity-0 transition-opacity group-hover:opacity-100",
                                  group.is_member &&
                                    "bg-primary/10 text-primary"
                                )}
                                onClick={(e) => {
                                  e.preventDefault()
                                  // User will follow link, so this is just for hover state
                                }}
                              >
                                {group.is_member ? "Member" : "Join"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between border-t pt-6">
                    <div className="text-sm text-muted-foreground">
                      Page {page} of {totalPages} • {total} total{" "}
                      {total === 1 ? "hub" : "hubs"}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1 || isLoading}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                          const pageNum = i + 1
                          const isCurrentPage = pageNum === page
                          const isWithinRange =
                            Math.abs(pageNum - page) <= 1 ||
                            pageNum === 1 ||
                            pageNum === totalPages

                          if (!isWithinRange) return null

                          return (
                            <Button
                              key={pageNum}
                              variant={isCurrentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              disabled={isLoading}
                              className="h-9 w-9 p-0"
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages || isLoading}
                      >
                        Next
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
