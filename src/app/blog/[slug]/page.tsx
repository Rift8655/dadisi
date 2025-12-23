"use client"

import { use, useState } from "react"
import Image from "next/image"

import { formatDate } from "@/lib/utils"
// import { CommentsClient } from "@/components/comments-client"
import { usePost } from "@/hooks/usePosts"

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const isLocal = process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("localhost") || 
                  process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("127.0.0.1")
  const { slug } = use(params)
  const { data: post, isLoading, error } = usePost(slug)

  if (isLoading) return <div className="container py-10">Loading post...</div>
  if (error || !post) return <div className="container py-10">Post not found.</div>

  return (
    <div className="container py-10">
      <h1 className="mb-2 text-3xl font-bold">{post.title}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        By {post.author?.username || "Unknown"} •{" "}
        {post.published_at ? formatDate(post.published_at) : "Draft"}
      </p>
      {post.featured_image && (
        <div className="relative mb-6 aspect-video w-full">
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            unoptimized={isLocal}
            className="rounded-md object-cover"
          />
        </div>
      )}
      <p className="mb-10 leading-7 text-muted-foreground">{post.content}</p>
      {/* <CommentsClient slug={slug} /> */}
    </div>
  )
}
