"use client"

import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { PostEditor } from "@/components/post-editor/PostEditor"

export default function AdminBlogCreatePage() {
  return (
    <AdminDashboardShell title="Create Post">
      <PostEditor mode="create" dashboardType="admin" />
    </AdminDashboardShell>
  )
}
