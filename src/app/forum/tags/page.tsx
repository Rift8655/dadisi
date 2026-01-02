"use client"

import { useState } from "react"
import Link from "next/link"
import { type ForumTag } from "@/schemas/forum"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Hash, Loader2, Search, Tag, TrendingUp } from "lucide-react"

import { forumApi } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
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

export default function TagsPage() {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("usage_count")

  const { data, isLoading, error } = useQuery({
    queryKey: ["forum-tags", search, sortBy],
    queryFn: () =>
      forumApi.tags.list({ search: search || undefined, sort: sortBy }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Backend returns { success, data: [...] } - handle wrapper
  const tags = (data as any)?.data ?? []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <ForumSidebar className="hidden lg:block" />

        <main className="min-w-0 flex-1">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/forum">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forum
            </Link>
          </Button>

          <div className="space-y-6">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
                <Tag className="h-8 w-8 text-primary" />
                Tags
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Browse discussions by topic tags.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usage_count">Most Popular</SelectItem>
                  <SelectItem value="name">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-destructive bg-destructive/5">
                <CardContent className="py-8 text-center">
                  <p className="text-destructive">
                    Failed to load tags. Please try again.
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
            {!isLoading && !error && tags.length === 0 && (
              <Card className="border-2 border-dashed bg-muted/30">
                <CardContent className="py-20 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Hash className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">No Tags Found</h3>
                  <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                    {search
                      ? `No tags matching "${search}".`
                      : "Tags will appear here once threads are tagged."}
                  </p>
                  {search && (
                    <Button variant="outline" onClick={() => setSearch("")}>
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tags Grid */}
            {!isLoading && tags.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {tags.map((tag: ForumTag) => (
                  <Link key={tag.id} href={`/forum/tags/${tag.slug}`}>
                    <Card
                      className="group h-full cursor-pointer transition-all hover:border-primary/50"
                      style={{
                        borderLeftColor: tag.color || "#6366f1",
                        borderLeftWidth: "4px",
                      }}
                    >
                      <CardContent className="flex h-full flex-col px-4 py-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Hash
                            className="h-4 w-4"
                            style={{ color: tag.color || "#6366f1" }}
                          />
                          <span className="truncate font-semibold transition-colors group-hover:text-primary">
                            {tag.name}
                          </span>
                        </div>
                        <div className="mt-auto flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>{tag.usage_count || 0} threads</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
