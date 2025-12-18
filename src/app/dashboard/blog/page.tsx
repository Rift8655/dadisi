"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { useAuth } from "@/store/auth"
import { postsApi } from "@/lib/api"

interface UserPost {
  id: number
  title: string
  slug: string
  status: "draft" | "published" | "archived"
  excerpt?: string
  created_at: string
  updated_at: string
  views_count: number
  comments_count: number
}

interface Category {
  id: number
  name: string
  slug: string
}

interface Tag {
  id: number
  name: string
  slug: string
}

export default function BlogPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<UserPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"posts" | "categories" | "tags">("posts")
  const [hasSubscription, setHasSubscription] = useState(true) // Check subscription status

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // For now, load all posts - would filter by current user in production
        const postsData = await postsApi.list({ page: 1 })
        const postsList = Array.isArray(postsData) ? postsData : []
        setPosts(
          postsList.map((p: any) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            status: p.status || "published",
            excerpt: p.excerpt,
            created_at: p.created_at,
            updated_at: p.updated_at,
            views_count: p.views_count || 0,
            comments_count: p.comments_count || 0,
          }))
        )

        // TODO: Load user's categories and tags from API
        setCategories([
          { id: 1, name: "Technology", slug: "technology" },
          { id: 2, name: "Community", slug: "community" },
        ])
        setTags([
          { id: 1, name: "Science", slug: "science" },
          { id: 2, name: "Events", slug: "events" },
          { id: 3, name: "Workshop", slug: "workshop" },
        ])
      } catch (error) {
        console.error("Failed to load blog data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500/10 text-green-600">Published</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "archived":
        return <Badge variant="outline">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Subscription gate
  if (!hasSubscription) {
    return (
      <UserDashboardShell title="Blog">
        <Card className="max-w-lg mx-auto mt-12">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <CardTitle>Premium Feature</CardTitle>
            <CardDescription>
              Creating and managing blog posts is a premium feature. Upgrade your subscription to unlock blogging capabilities.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/dashboard/subscription">Upgrade Now</Link>
            </Button>
          </CardContent>
        </Card>
      </UserDashboardShell>
    )
  }

  return (
    <UserDashboardShell title="Blog">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-medium">Manage Your Content</h2>
            <p className="text-sm text-muted-foreground">
              Create, edit, and manage your blog posts, categories, and tags.
            </p>
          </div>
          <Button>
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {(["posts", "categories", "tags"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "posts" && (
          <Card>
            <CardHeader>
              <CardTitle>Your Posts</CardTitle>
              <CardDescription>
                {posts.length} post{posts.length !== 1 ? "s" : ""} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <div className="divide-y">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{post.title}</h4>
                          {getStatusBadge(post.status)}
                        </div>
                        <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                          <span>{formatDate(post.created_at)}</span>
                          <span>{post.views_count} views</span>
                          <span>{post.comments_count} comments</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/blog/${post.slug}`}>View</Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p className="mb-2">No posts yet</p>
                  <Button size="sm">Create Your First Post</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "categories" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Organize your posts with categories</CardDescription>
              </div>
              <Button size="sm" variant="outline">
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              {categories.length > 0 ? (
                <div className="divide-y">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <span className="font-medium">{category.name}</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-muted-foreground">No categories yet</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "tags" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Label your posts with tags</CardDescription>
              </div>
              <Button size="sm" variant="outline">
                Add Tag
              </Button>
            </CardHeader>
            <CardContent>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                    >
                      {tag.name}
                      <button className="ml-1 text-muted-foreground hover:text-destructive">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-muted-foreground">No tags yet</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </UserDashboardShell>
  )
}
