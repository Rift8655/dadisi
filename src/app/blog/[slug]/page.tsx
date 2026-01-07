"use client"

import { use, useState } from "react"
import Image from "next/image"

import { formatDate } from "@/lib/utils"
import { usePost } from "@/hooks/usePosts"
import { CommentsClient } from "@/components/blog/CommentsClient"
import { PostGallery } from "@/components/blog/PostGallery"
import { PostInteractions } from "@/components/blog/PostInteractions"

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const isLocal =
    process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("localhost") ||
    process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("127.0.0.1")
  const { slug } = use(params)
  const { data: post, isLoading, error } = usePost(slug)

  if (isLoading) return <div className="container py-10">Loading post...</div>
  if (error || !post)
    return <div className="container py-10">Post not found.</div>

  const galleryImages = post.gallery_images?.length
    ? post.gallery_images
    : post.media?.filter((m) => m.pivot?.role === "gallery") || []

  return (
    <div className="container py-10">
      <h1 className="mb-2 text-3xl font-bold">{post.title}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        By {post.author?.username || "Unknown"} •{" "}
        {post.published_at ? formatDate(post.published_at) : "Draft"}
      </p>
      {post.featured_image && (
        <div className="mx-auto max-w-4xl">
          <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl border bg-muted shadow-sm">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              unoptimized={isLocal}
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
            />
          </div>
        </div>
      )}

      {/* Gallery Images - Robust conditional rendering */}
      {galleryImages.length > 0 && (
        <PostGallery images={galleryImages as any} className="mb-8" />
      )}
      <div
        className="prose prose-lg dark:prose-invert mb-10 max-w-none"
        dangerouslySetInnerHTML={{ __html: post.body || post.content || "" }}
      />

      {/* Interactions (Likes/Comment count) */}
      <PostInteractions
        slug={slug}
        likesCount={post.likes_count}
        dislikesCount={post.dislikes_count}
        commentsCount={post.comments_count}
      />

      {/* Comments Section */}
      <CommentsClient slug={slug} allowComments={post.allow_comments} />
    </div>
  )
}
