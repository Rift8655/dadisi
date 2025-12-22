"use client"

import { useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Calendar,
  Plus,
  Edit,
  Eye,
  Trash2,
  Users,
  DollarSign,
  QrCode,
  MoreHorizontal,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { useAuth } from "@/store/auth"
import { eventsApi, api } from "@/lib/api"
import type { Event } from "@/types"
import Swal from "sweetalert2"

export default function OrganizerEventsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["organizer-events"],
    queryFn: () => eventsApi.my(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] })
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Event has been deleted.",
        timer: 1500,
        showConfirmButton: false,
      })
    },
    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to delete event.",
      })
    }
  })

  const stats = useMemo(() => {
    const now = new Date()
    return {
      totalEvents: events.length,
      totalRegistrations: events.reduce((acc: number, e: Event) => acc + (e.capacity || 0), 0),
      pendingPayouts: 0, // Would come from payouts API
      upcomingEvents: events.filter((e: Event) => new Date(e.starts_at) > now).length,
    }
  }, [events])

  const handleDeleteEvent = async (event: Event) => {
    const result = await Swal.fire({
      title: "Delete Event?",
      text: `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    })

    if (result.isConfirmed) {
      deleteMutation.mutate(event.id)
    }
  }

  const getStatusBadge = (event: Event) => {
    const now = new Date()
    const startsAt = new Date(event.starts_at)
    
    if (event.status === "suspended") {
      return <Badge variant="danger">Suspended</Badge>
    }
    if (event.status === "draft") {
      return <Badge variant="secondary">Draft</Badge>
    }
    if (startsAt < now) {
      return <Badge variant="outline">Past</Badge>
    }
    if (event.featured) {
      return <Badge variant="warning">Featured</Badge>
    }
    return <Badge variant="success">Published</Badge>
  }

  return (
    <UserDashboardShell title="My Events">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalEvents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">KES {stats.pendingPayouts.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Events</h2>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/organizer/payouts">
                <DollarSign className="h-4 w-4 mr-2" />
                Payouts
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/organizer/events/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </div>
        </div>

        {/* Events Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No events yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first event to start managing registrations.
                </p>
                <Button asChild>
                  <Link href="/dashboard/organizer/events/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Registrations</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.is_online ? "Online" : event.venue || event.county?.name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(event.starts_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{getStatusBadge(event)}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/dashboard/organizer/events/${event.slug}/registrations`}>
                            <Users className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        {event.price ? `${event.currency} ${event.price.toLocaleString()}` : "Free"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/events/${event.slug}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Public Page
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/organizer/events/${event.slug}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Event
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/organizer/events/${event.slug}/scan`}>
                                <QrCode className="h-4 w-4 mr-2" />
                                Scan Tickets
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteEvent(event)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </UserDashboardShell>
  )
}
