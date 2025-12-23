"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { labBookingsAdminApi, labSpacesAdminApi, LabBookingStats } from "@/lib/api-admin"
import { useAuth } from "@/store/auth"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Unauthorized } from "@/components/unauthorized"
import { 
  BarChart3, 
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  FlaskConical,
  Loader2,
  ExternalLink,
} from "lucide-react"

const STATUS_COLORS = {
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  completed: "bg-blue-500",
  no_show: "bg-orange-500",
  cancelled: "bg-gray-500",
}

export default function AdminLabAttendancePage() {
  const { user, isLoading: authLoading } = useAuth()
  
  const [period, setPeriod] = useState("month")
  const [spaceFilter, setSpaceFilter] = useState<string>("all")

  // Fetch stats
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ["admin-lab-stats", period, spaceFilter],
    queryFn: async () => {
      const params: any = { period }
      if (spaceFilter !== "all") params.lab_space_id = parseInt(spaceFilter)
      const res = await labBookingsAdminApi.stats(params)
      return res.data
    },
  })

  // Fetch spaces for filter
  const { data: spacesData } = useQuery({
    queryKey: ["admin-lab-spaces-filter"],
    queryFn: async () => {
      const res = await labSpacesAdminApi.list({ per_page: 50 })
      return res.data
    },
  })

  const stats = statsData
  const spaces = spacesData || []

  // Authorization check
  const canView = user?.ui_permissions?.can_view_lab_reports

  if (authLoading) {
    return (
      <AdminDashboardShell title="Lab Attendance Reports">
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AdminDashboardShell>
    )
  }

  if (!canView) {
    return <Unauthorized actionHref="/admin" />
  }

  return (
    <AdminDashboardShell title="Lab Attendance Reports">
      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Lab Attendance Reports
                </CardTitle>
                <CardDescription>
                  {stats?.date_range && (
                    <>
                      Showing data from {stats.date_range.from} to {stats.date_range.to}
                    </>
                  )}
                </CardDescription>
              </div>

              <div className="flex gap-2">
                {/* Period Filter */}
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>

                {/* Space Filter */}
                <Select value={spaceFilter} onValueChange={setSpaceFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="All Spaces" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Spaces</SelectItem>
                    {spaces.map((space) => (
                      <SelectItem key={space.id} value={String(space.id)}>
                        {space.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center text-muted-foreground">
            Failed to load attendance data
          </Card>
        ) : stats ? (
          <>
            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_bookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.by_status.completed} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hours Booked</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.hours.total_booked}h</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.hours.total_used}h actually used
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Show Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.attendance.show_rate}%</div>
                  <Progress value={stats.attendance.show_rate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">No-Shows</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.attendance.no_show_count}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Avg {stats.hours.average_per_booking}h per booking
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(stats.by_status).map(([status, count]) => (
                    <div
                      key={status}
                      className="flex flex-col items-center p-4 rounded-lg border"
                    >
                      <div
                        className={`h-3 w-3 rounded-full mb-2 ${
                          STATUS_COLORS[status as keyof typeof STATUS_COLORS]
                        }`}
                      />
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {status.replace("_", " ")}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Spaces & Top Users */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Spaces */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" />
                    Most Popular Spaces
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.top_spaces.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No booking data available
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Space</TableHead>
                          <TableHead className="text-right">Bookings</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.top_spaces.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{item.space}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary">{item.bookings}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {item.slug && (
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/spaces/${item.slug}`}>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </Link>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Top Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Most Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.top_users.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No booking data available
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead className="text-right">Bookings</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.top_users.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.user}</div>
                                <div className="text-xs text-muted-foreground">
                                  {item.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary">{item.bookings}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </AdminDashboardShell>
  )
}
