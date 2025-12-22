"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  MessageCircle,
  Users,
  Calendar,
  BookOpen,
  HelpCircle,
  Megaphone,
  Plus,
} from "lucide-react"
import { useForumCategories } from "@/hooks/useForum"
import { type ForumCategory } from "@/schemas/forum"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ForumSidebar } from "@/components/forum/ForumSidebar"
import { useAuth } from "@/store/auth"

// Icon mapping for category icons
const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  "message-circle": MessageCircle,
  users: Users,
  calendar: Calendar,
  "book-open": BookOpen,
  "help-circle": HelpCircle,
  megaphone: Megaphone,
}

export default function ForumPage() {
  const { isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Use the new hook with proper caching (1 hour staleTime)
  const { data, isLoading, error } = useForumCategories()
  
  // Ensure we show loading state on server and until mounted on client
  // to avoid hydration mismatch with cached data
  const isActuallyLoading = !mounted || isLoading

  // Ensure categories is always an array
  const categories = Array.isArray(data) ? data : []

  // Separate root categories and their children
  const rootCategories = categories.filter((c) => !c.parent_id)

  // Helper to get subcategories
  const getSubcategories = (parentId: number) =>
    categories.filter((c) => c.parent_id === parentId)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex gap-8">
        {/* Sidebar */}
        <ForumSidebar className="hidden lg:block" />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Community Forum</h1>
              <p className="text-muted-foreground mt-1">
                Join discussions, share ideas, and connect with the Dadisi community.
              </p>
            </div>
            {mounted && isAuthenticated && (
              <Button asChild>
                <Link href="/forum/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Topic
                </Link>
              </Button>
            )}
          </div>

          {/* Loading State */}
          {isActuallyLoading && (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          )}

          {/* Error State */}
          {mounted && error && (
            <div className="text-center py-12">
              <p className="text-destructive">
                Failed to load forum categories. Please try again later.
              </p>
            </div>
          )}

          {/* Categories Grid */}
          {!isActuallyLoading && !error && (
            <div className="space-y-4">
              {rootCategories.map((category: ForumCategory) => {
                const IconComponent =
                  iconMap[category.icon || "message-circle"] || MessageCircle
                const subcategories = getSubcategories(category.id)

                return (
                  <Card
                    key={category.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{
                              backgroundColor: category.color
                                ? `${category.color}20`
                                : "hsl(var(--primary) / 0.1)",
                            }}
                          >
                            <IconComponent
                              className="h-5 w-5"
                              style={{
                                color: category.color || "hsl(var(--primary))",
                              }}
                            />
                          </div>
                          <div>
                            <Link
                              href={`/forum/${category.slug}`}
                              className="hover:underline"
                            >
                              <CardTitle className="text-lg">
                                {category.name}
                              </CardTitle>
                            </Link>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {category.description ||
                                "Explore discussions in this category."}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>
                            {category.threads_count ?? 0} topics
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Subcategories */}
                    {subcategories.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          {subcategories.map((sub: ForumCategory) => (
                            <Link
                              key={sub.id}
                              href={`/forum/${sub.slug}`}
                            >
                              <Badge
                                variant="secondary"
                                className="hover:bg-secondary/80 cursor-pointer"
                              >
                                {sub.name}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}

              {rootCategories.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No forum categories available yet.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
