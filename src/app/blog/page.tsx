"use client"

import Link from "next/link"
import Image from "next/image"

import { formatDate } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { usePosts } from "@/hooks/usePosts"

export default function BlogPage() {
  const { data: posts = [], isLoading } = usePosts()

  if (isLoading) {
    return (
      <div className="container py-10">
        <h1 className="mb-6 text-3xl font-bold">Blog</h1>
        <div>Loading posts...</div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Blog</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.title}</CardTitle>
              <CardDescription>
                By {p.author?.username || "Unknown"} •{" "}
                {p.published_at ? formatDate(p.published_at) : "Draft"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {p.featured_image && (
                <div className="relative mb-3 aspect-video w-full">
                  <Image
                    src={p.featured_image}
                    alt={p.title}
                    fill
                    unoptimized
                    className="rounded-md object-cover"
                  />
                </div>
              )}
              <p className="mb-3 text-sm text-muted-foreground">{p.excerpt}</p>
              <Link
                href={`/blog/${p.slug}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                Read more →
              </Link>
            </CardContent>
          </Card>
        ))}
        {!isLoading && posts.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            No posts found.
          </div>
        )}
      </div>
    </div>
  )
}
