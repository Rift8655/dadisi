"use client"

import { useBlogStore } from "@/store/blog"
import { usePosts } from "@/hooks/usePosts"
import {
  BlogCard,
  BlogControls,
  BlogSearch,
  BlogSidebar,
  BlogPagination,
} from "@/components/blog"
import { PageShell } from "@/components/page-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { FileText } from "lucide-react"

export default function BlogPage() {
  const {
    viewType,
    perPage,
    searchQuery,
    selectedCategoryId,
    selectedTagIds,
    currentPage,
  } = useBlogStore()

  // Build query params
  const queryParams = {
    page: currentPage,
    per_page: perPage,
    search: searchQuery || undefined,
    category_id: selectedCategoryId ?? undefined,
    // Note: Backend currently only supports single tag_id, we'll use the first one
    tag_id: selectedTagIds.length > 0 ? selectedTagIds[0] : undefined,
  }

  const { data, isLoading, isError } = usePosts(queryParams)

  const posts = data?.data ?? []
  const totalPages = data?.last_page ?? 1
  const totalItems = data?.total ?? 0

  // Grid classes based on view type
  const gridClasses = cn(
    "gap-6",
    viewType === "list" && "flex flex-col",
    viewType === "grid" && "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
    viewType === "masonry" && "columns-1 md:columns-2 xl:columns-3 space-y-6"
  )

  return (
    <PageShell title="Blog">
      <div className="space-y-8">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Explore Our Articles
          </h2>
          <p className="text-muted-foreground mt-1">
            Discover insights, stories, and updates from our community.
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
        {/* Main Content - Now on the LEFT */}
        <div className="flex-1">
          {/* Controls */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${totalItems} posts found`}
            </p>
            <BlogControls />
          </div>

          {/* Posts */}
          {isLoading ? (
            <div className={gridClasses}>
              {[...Array(perPage > 6 ? 6 : perPage)].map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium text-destructive">
                Failed to load posts
              </p>
              <p className="text-sm text-muted-foreground">
                Please try again later
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">No posts found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : viewType === "masonry" ? (
            <div className={gridClasses}>
              {posts.map((post) => (
                <div key={post.id} className="break-inside-avoid">
                  <BlogCard post={post} viewType={viewType} />
                </div>
              ))}
            </div>
          ) : (
            <div className={gridClasses}>
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} viewType={viewType} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && posts.length > 0 && (
            <div className="mt-8">
              <BlogPagination totalPages={totalPages} totalItems={totalItems} />
            </div>
          )}
        </div>

        {/* Sidebar - Now on the RIGHT */}
        <div className="w-full shrink-0 lg:w-64 lg:order-last">
          <div className="sticky top-20">
            <BlogSearch />
            <div className="mt-6">
              <BlogSidebar />
            </div>
          </div>
        </div>
        </div>
      </div>
    </PageShell>
  )
}
