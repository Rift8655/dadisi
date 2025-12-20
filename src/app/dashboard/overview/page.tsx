"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { useAuth } from "@/store/auth"
import { useMemberProfileQuery } from "@/hooks/useMemberProfileQuery"
import { eventsApi, donationsApi, postsApi } from "@/lib/api"

interface UpcomingEvent {
  id: number
  title: string
  starts_at: string
}

interface RecentDonation {
  id: number
  amount: number
  currency: string
  created_at: string
}

interface RecentPost {
  id: number
  title: string
  slug: string
  created_at: string
}

function StatCard({
  title,
  value,
  change,
  icon,
}: {
  title: string
  value: string
  change?: string
  icon?: React.ReactNode
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-4 top-4 text-muted-foreground/20">
        {icon}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {change && <p className="mt-1 text-xs text-muted-foreground">{change}</p>}
      </CardContent>
    </Card>
  )
}

export default function OverviewPage() {
  const { user, isAuthenticated } = useAuth()
  const { data: memberProfile, isLoading: profileLoading } = useMemberProfileQuery(isAuthenticated)

  // Fetch events
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["dashboard-events"],
    queryFn: async () => {
      const data = await eventsApi.list({ page: 1 })
      const events = Array.isArray(data) ? data : []
      return events.slice(0, 3).map((e: any) => ({
        id: e.id,
        title: e.title,
        starts_at: e.starts_at,
      })) as UpcomingEvent[]
    },
    enabled: isAuthenticated,
  })

  // Fetch donations
  const { data: donationsData, isLoading: donationsLoading } = useQuery({
    queryKey: ["dashboard-donations"],
    queryFn: async () => {
      const data = await donationsApi.list({ page: 1 })
      const donations = (data as any)?.data || []
      return {
        recent: donations.slice(0, 3).map((d: any) => ({
          id: d.id,
          amount: d.amount,
          currency: d.currency || "KES",
          created_at: d.created_at,
        })) as RecentDonation[],
        total: donations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0),
      }
    },
    enabled: isAuthenticated,
  })

  // Fetch posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["dashboard-posts"],
    queryFn: async () => {
      const data = await postsApi.list({ page: 1 })
      const posts = Array.isArray(data) ? data : []
      return posts.slice(0, 3).map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        created_at: p.created_at,
      })) as RecentPost[]
    },
    enabled: isAuthenticated,
  })

  const loading = eventsLoading || donationsLoading || postsLoading
  const upcomingEvents = eventsData ?? []
  const recentDonations = donationsData?.recent ?? []
  const recentPosts = postsData ?? []

  const stats = {
    membershipStatus: memberProfile?.plan_type || "Member",
    membershipRenewal: memberProfile?.plan_expires_at || null,
    eventsRsvpCount: upcomingEvents.length,
    messagesCount: 0,
    donationsTotal: donationsData?.total ?? 0,
    donationsCurrency: "KES",
  }

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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <UserDashboardShell title="Dashboard Overview">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="rounded-lg border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <h2 className="text-2xl font-bold">
            Welcome back, {user?.username || "Member"}! 👋
          </h2>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Membership Status"
            value={stats.membershipStatus}
            change={stats.membershipRenewal ? `Renewal: ${formatDate(stats.membershipRenewal)}` : undefined}
            icon={
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <StatCard
            title="Events RSVP'd"
            value={String(stats.eventsRsvpCount)}
            change="View all events"
            icon={
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Total Donations"
            value={formatCurrency(stats.donationsTotal, stats.donationsCurrency)}
            change="Thank you for your support!"
            icon={
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          />
          <StatCard
            title="Notifications"
            value={String(stats.messagesCount)}
            change="No new messages"
            icon={
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
          />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Events you might be interested in</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/events">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : upcomingEvents.length > 0 ? (
                <ul className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <li
                      key={event.id}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <span className="font-medium">{event.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(event.starts_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Donations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Your contribution history</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/donations">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : recentDonations.length > 0 ? (
                <ul className="space-y-3">
                  {recentDonations.map((donation) => (
                    <li
                      key={donation.id}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <span className="font-medium">
                        {formatCurrency(donation.amount, donation.currency)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(donation.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">No donations yet</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/donations">Make a Donation</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Blog Posts */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Blog Posts</CardTitle>
                <CardDescription>Latest updates from the community</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/blog">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : recentPosts.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {recentPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <h4 className="font-medium line-clamp-2">{post.title}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(post.created_at)}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No blog posts available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/events">Browse Events</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/donations">Make a Donation</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/subscription">Manage Subscription</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/support">Contact Support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserDashboardShell>
  )
}
