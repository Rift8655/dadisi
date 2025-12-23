"use client"

import Image from "next/image"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Post } from "@/schemas/post"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BlogViewType } from "@/store/blog"
import { cn } from "@/lib/utils"

interface BlogCardProps {
  post: Post
  viewType: BlogViewType
}

export function BlogCard({ post, viewType }: BlogCardProps) {
  const isLocal = process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("localhost") || 
                  process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("127.0.0.1")
  const isListView = viewType === "list"
  
  return (
    <Card
      className={cn(
        "group overflow-hidden transition-shadow hover:shadow-lg",
        isListView && "flex flex-row"
      )}
    >
      {/* Featured Image */}
      {post.featured_image && (
        <div
          className={cn(
            "relative bg-muted",
            isListView ? "w-48 flex-shrink-0" : "aspect-video w-full"
          )}
        >
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            unoptimized={isLocal}
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className={cn("flex flex-1 flex-col", isListView && "justify-center")}>
        <CardHeader className={cn(isListView && "py-3")}>
          <div className="flex flex-wrap gap-1 mb-2">
            {post.categories?.slice(0, 2).map((cat) => (
              <Badge key={cat.id} variant="secondary" className="text-xs">
                {cat.name}
              </Badge>
            ))}
          </div>
          <CardTitle className="line-clamp-2 text-lg">
            <Link
              href={`/blog/${post.slug}`}
              className="hover:text-primary transition-colors"
            >
              {post.title}
            </Link>
          </CardTitle>
          <CardDescription className="text-xs">
            By {post.author?.username || "Unknown"} •{" "}
            {post.published_at ? formatDate(post.published_at) : "Draft"}
          </CardDescription>
        </CardHeader>

        <CardContent className={cn("flex-1", isListView && "py-2")}>
          <p className={cn("text-sm text-muted-foreground", isListView ? "line-clamp-1" : "line-clamp-3")}>
            {post.excerpt}
          </p>
          {!isListView && (
            <div className="mt-4 flex flex-wrap gap-1">
              {post.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  #{tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}
