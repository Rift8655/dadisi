"use client"

import { use } from "react"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { PostEditor } from "@/components/post-editor/PostEditor"

interface EditPostPageProps {
  params: Promise<{ slug: string }>
}

export default function AdminBlogEditPage({ params }: EditPostPageProps) {
  const resolvedParams = use(params)
  const postSlug = resolvedParams.slug

  if (!postSlug) {
    return (
      <AdminDashboardShell title="Edit Post">
        <div className="p-8 text-center text-muted-foreground">
          Invalid post slug
        </div>
      </AdminDashboardShell>
    )
  }

  return (
    <AdminDashboardShell title="Edit Post">
      <PostEditor mode="edit" postSlug={postSlug} dashboardType="admin" />
    </AdminDashboardShell>
  )
}
