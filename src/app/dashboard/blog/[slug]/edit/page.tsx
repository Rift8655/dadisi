"use client"

import { use } from "react"
import { PostEditor } from "@/components/post-editor/PostEditor"
import { UserDashboardShell } from "@/components/user-dashboard-shell"

interface EditPostPageProps {
  params: Promise<{ slug: string }>
}

export default function UserBlogEditPage({ params }: EditPostPageProps) {
  const resolvedParams = use(params)
  const postSlug = resolvedParams.slug

  if (!postSlug) {
    return (
      <UserDashboardShell title="Edit Post">
        <div className="p-8 text-center text-muted-foreground">
          Invalid post slug
        </div>
      </UserDashboardShell>
    )
  }

  return (
    <UserDashboardShell title="Edit Post">
      <PostEditor mode="edit" postSlug={postSlug} dashboardType="user" />
    </UserDashboardShell>
  )
}
