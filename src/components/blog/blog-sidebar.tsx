"use client"

import { useBlogStore } from "@/store/blog"
import { usePublicCategories, usePublicTags } from "@/hooks/usePosts"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { X, Tag, Folder } from "lucide-react"

export function BlogSidebar() {
  const {
    selectedCategoryId,
    setSelectedCategoryId,
    selectedTagIds,
    toggleTagId,
    clearTagIds,
    resetFilters,
  } = useBlogStore()

  const { data: categories = [], isLoading: loadingCategories } = usePublicCategories()
  const { data: tags = [], isLoading: loadingTags } = usePublicTags()

  const hasActiveFilters = selectedCategoryId !== null || selectedTagIds.length > 0

  return (
    <aside className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={resetFilters}
        >
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}

      {/* Categories */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Folder className="h-4 w-4" />
          Categories
        </h3>
        {loadingCategories ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories</p>
        ) : (
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() =>
                    setSelectedCategoryId(
                      selectedCategoryId === cat.id ? null : cat.id
                    )
                  }
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                    selectedCategoryId === cat.id &&
                      "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  <span>{cat.name}</span>
                  <Badge
                    variant={selectedCategoryId === cat.id ? "secondary" : "outline"}
                    className="ml-2"
                  >
                    {cat.post_count}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tags */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Tag className="h-4 w-4" />
          Tags
        </h3>
        {loadingTags ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-7 w-16" />
            ))}
          </div>
        ) : tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tags</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTagId(tag.id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors hover:bg-accent",
                  selectedTagIds.includes(tag.id) &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                #{tag.name}
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 py-0.5 text-xs",
                    selectedTagIds.includes(tag.id)
                      ? "bg-primary-foreground/20"
                      : "bg-muted"
                  )}
                >
                  {tag.post_count}
                </span>
              </button>
            ))}
          </div>
        )}
        {selectedTagIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={clearTagIds}
          >
            Clear tag filters
          </Button>
        )}
      </div>
    </aside>
  )
}
