"use client"

import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { PostEditor } from "@/components/post-editor/PostEditor"

export default function UserBlogCreatePage() {
  return (
    <UserDashboardShell title="Create Post">
      <PostEditor mode="create" dashboardType="user" />
    </UserDashboardShell>
  )
}
