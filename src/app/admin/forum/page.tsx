"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  MessageSquare,
  Users,
  Tag,
  Folder,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Clock,
} from "lucide-react"
import { useAuth } from "@/store/auth"
import { adminApi } from "@/lib/api-admin"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { AccessDenied } from "@/components/admin/AccessDenied"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface ForumStats {
  total_threads: number
  total_posts: number
  total_categories: number
  total_tags: number
  total_groups: number
  total_members: number
  threads_trend: number
  posts_trend: number
  recent_activity: Array<{
    id: number
    type: string
    title: string
    user: string
    category: string
    created_at: string
  }>
}

export default function ForumAdminPage() {
  const { user, isAuthenticated } = useAuth()

  // Check permission
  const canModerate = user?.ui_permissions?.can_moderate_forum || 
                      user?.ui_permissions?.can_manage_forum_tags ||
                      user?.ui_permissions?.can_manage_forum_categories ||
                      user?.roles?.some((r: { name: string }) => ['admin', 'super_admin', 'moderator'].includes(r.name))

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-forum-stats"],
    queryFn: () => adminApi.forum.stats(),
    enabled: !!isAuthenticated && canModerate,
  })

  const stats = data?.data as ForumStats | undefined

  if (!isAuthenticated) {
    return (
      <AdminDashboardShell title="Forum Admin">
        <AccessDenied message="Please log in to access forum administration." />
      </AdminDashboardShell>
    )
  }

  if (!canModerate) {
    return (
      <AdminDashboardShell title="Forum Admin">
        <AccessDenied 
          message="You don't have permission to moderate the forum."
          requiredPermission="Forum Moderator"
        />
      </AdminDashboardShell>
    )
  }

  const statCards = [
    { 
      title: "Threads", 
      value: stats?.total_threads ?? 0, 
      trend: stats?.threads_trend ?? 0,
      icon: MessageSquare, 
      href: "/admin/forum/threads", 
      color: "text-blue-500" 
    },
    { 
      title: "Posts", 
      value: stats?.total_posts ?? 0, 
      trend: stats?.posts_trend ?? 0,
      icon: FileText, 
      href: "/admin/forum/threads", 
      color: "text-green-500" 
    },
    { 
      title: "Tags", 
      value: stats?.total_tags ?? 0, 
      icon: Tag, 
      href: "/admin/forum/tags", 
      color: "text-purple-500" 
    },
    { 
      title: "Categories", 
      value: stats?.total_categories ?? 0, 
      icon: Folder, 
      href: "/admin/forum/categories", 
      color: "text-orange-500" 
    },
    { 
      title: "Groups", 
      value: stats?.total_groups ?? 0, 
      icon: Users, 
      href: "/admin/forum/groups", 
      color: "text-cyan-500" 
    },
  ]

  const quickActions = [
    { title: "Manage Threads", description: "Pin, lock, or delete threads", href: "/admin/forum/threads", icon: MessageSquare },
    { title: "Manage Tags", description: "Create and organize tags", href: "/admin/forum/tags", icon: Tag },
    { title: "Manage Categories", description: "Configure forum categories", href: "/admin/forum/categories", icon: Folder },
    { title: "Manage Groups", description: "County community hubs", href: "/admin/forum/groups", icon: Users },
  ]

  return (
    <AdminDashboardShell title="Forum Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Forum Administration</h1>
            <p className="text-muted-foreground mt-1">
              Manage forum content, moderation, and community settings.
            </p>
          </div>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="py-6">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-full py-12 text-center text-destructive border rounded-lg bg-destructive/5">
              Failed to load stats. Please try refreshing.
            </div>
          ) : (
            statCards.map((stat) => (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:border-primary/50 transition-all cursor-pointer group">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      {stat.trend !== undefined && stat.trend !== 0 && (
                        <div className={`flex items-center text-xs font-medium ${stat.trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {stat.trend > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                          {Math.abs(stat.trend)}%
                        </div>
                      )}
                    </div>
                    <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{stat.title}</div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest threads and discussions on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-1/3 mb-1" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats?.recent_activity.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No recent activity found.</p>
              ) : (
                <div className="space-y-4">
                  {stats?.recent_activity.map((item) => (
                    <div key={item.id} className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex gap-4">
                        <div className="bg-primary/10 p-2 rounded-full h-10 w-10 flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm hover:text-primary cursor-pointer line-clamp-1">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            by <span className="font-medium text-foreground">{item.user}</span> in <span className="font-medium text-foreground">{item.category}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <Badge variant="outline" className="text-[10px] h-5">Thread</Badge>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="ghost" className="w-full mt-4 text-xs h-8" asChild>
                <Link href="/admin/forum/threads">
                  View All Threads <ArrowRight className="h-3 w-3 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common moderation tasks.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {quickActions.map((action) => (
                <Button key={action.title} variant="outline" className="justify-start h-auto py-3 px-4 gap-4" asChild>
                  <Link href={action.href}>
                    <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardShell>
  )
}
