"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/store/auth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { QrCode, Search, Ticket as TicketIcon } from "lucide-react"
import { toast } from "sonner"

import { eventOrdersApi, registrationsApi, type TicketOrder } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserDashboardShell } from "@/components/user-dashboard-shell"

interface UserRegistration {
  id: number
  status: "confirmed" | "pending" | "waitlisted" | "cancelled" | "attended"
  confirmation_code: string
  qr_code_token?: string
  event: {
    id: number
    title: string
    description?: string
    starts_at: string
    ends_at?: string
    venue?: string
    is_online: boolean
  }
  ticket: {
    id: number
    name: string
    price: number
    currency: string
  }
  created_at: string
  // Computed fields
  eventStatus: "upcoming" | "ongoing" | "past"
}

export default function MyRsvpsPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all")
  const queryClient = useQueryClient()

  const { data: registrations = [], isLoading: loadingRegs } = useQuery({
    queryKey: ["user-registrations"],
    queryFn: async () => {
      const response = await registrationsApi.my()
      const registrationsList = response?.data || []

      const now = new Date()
      return registrationsList.map((r) => {
        const startsAt = new Date(r.event.starts_at)
        const endsAt = r.event.ends_at ? new Date(r.event.ends_at) : null

        let eventStatus: "upcoming" | "ongoing" | "past" = "upcoming"
        if (endsAt && now > endsAt) {
          eventStatus = "past"
        } else if (now >= startsAt && (!endsAt || now <= endsAt)) {
          eventStatus = "ongoing"
        }

        return {
          ...r,
          eventStatus,
        } as UserRegistration
      })
    },
  })

  const { data: tickets = [], isLoading: loadingTickets } = useQuery({
    queryKey: ["user-event-tickets"],
    queryFn: async () => {
      const response = await eventOrdersApi.myTickets({ status: "paid" })
      return response.data as TicketOrder[]
    },
  })

  const loading = loadingRegs || loadingTickets

  const cancelMutation = useMutation({
    mutationFn: (registrationId: number) =>
      registrationsApi.cancel(registrationId),
    onSuccess: () => {
      toast.success("Registration cancelled successfully")
      queryClient.invalidateQueries({ queryKey: ["user-registrations"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel registration")
    },
  })

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    } catch {
      return ""
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getEventStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-500/10 text-blue-600">Upcoming</Badge>
      case "ongoing":
        return (
          <Badge className="bg-green-500/10 text-green-600">In Progress</Badge>
        )
      case "past":
        return <Badge variant="secondary">Past</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRsvpStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-500/10 text-green-600">Confirmed</Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600">Pending</Badge>
        )
      case "waitlisted":
        return (
          <Badge className="bg-orange-500/10 text-orange-600">Waitlisted</Badge>
        )
      case "attended":
        return (
          <Badge className="bg-purple-500/10 text-purple-600">Attended</Badge>
        )
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-600">Cancelled</Badge>
      default:
        return null
    }
  }

  const filteredRegistrations = registrations.filter((reg) => {
    if (filter === "all") return reg.status !== "cancelled"
    if (filter === "upcoming")
      return reg.eventStatus === "upcoming" || reg.eventStatus === "ongoing"
    if (filter === "past") return reg.eventStatus === "past"
    return true
  })

  const activeRegistrations = registrations.filter(
    (r) => r.status !== "cancelled"
  )
  const upcomingCount = activeRegistrations.filter(
    (r) => r.eventStatus === "upcoming" || r.eventStatus === "ongoing"
  ).length
  const attendedCount = activeRegistrations.filter(
    (r) => r.status === "attended"
  ).length

  return (
    <UserDashboardShell title="My RSVPs">
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total RSVPs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{activeRegistrations.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Events you&apos;ve registered for
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{upcomingCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Events to attend
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Attended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{attendedCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Events you&apos;ve checked into
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="rsvps" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="rsvps">
              Free RSVPs ({activeRegistrations.length})
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2">
              <TicketIcon className="h-4 w-4" />
              Paid Tickets ({tickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rsvps" className="space-y-6">
            {/* Filter Tabs (RSVPs) */}
            <div className="flex gap-1 border-b">
              {(["all", "upcoming", "past"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    filter === tab
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "all" ? "All RSVPs" : tab}
                </button>
              ))}
            </div>

            {/* RSVPs List */}
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="h-24 animate-pulse rounded bg-muted" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg) => (
                  <Card key={reg.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Date Column */}
                        <div className="flex-shrink-0 bg-primary/5 p-6 text-center md:w-32">
                          <p className="text-sm font-medium text-muted-foreground">
                            {new Date(reg.event.starts_at).toLocaleDateString(
                              "en-US",
                              { month: "short" }
                            )}
                          </p>
                          <p className="text-3xl font-bold">
                            {new Date(reg.event.starts_at).getDate()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(reg.event.starts_at)}
                          </p>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 p-6">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold">
                                  {reg.event.title}
                                </h3>
                                {getEventStatusBadge(reg.eventStatus)}
                                {getRsvpStatusBadge(reg.status)}
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  {reg.event.is_online
                                    ? "Online Event"
                                    : reg.event.venue || "TBA"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2 2 2 0 012 2v3a2 2 0 01-2 2M19 5a2 2 0 012 2v3a2 2 0 01-2 2 2 2 0 00-2 2v3a2 2 0 002 2"
                                    />
                                  </svg>
                                  {reg.ticket.name}
                                  {reg.ticket.price > 0 &&
                                    ` (${formatCurrency(reg.ticket.price, reg.ticket.currency)})`}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Confirmation:{" "}
                                <code className="rounded bg-muted px-1.5 py-0.5">
                                  {reg.confirmation_code}
                                </code>
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              {reg.status === "confirmed" &&
                                reg.eventStatus !== "past" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (
                                        confirm(
                                          "Are you sure you want to cancel this registration?"
                                        )
                                      ) {
                                        cancelMutation.mutate(reg.id)
                                      }
                                    }}
                                    disabled={cancelMutation.isPending}
                                  >
                                    Cancel RSVP
                                  </Button>
                                )}
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/events/${reg.event.id}`}>
                                  View Event
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-muted-foreground/50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="mt-4 font-medium">No registrations found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {filter === "all"
                        ? "You haven't RSVP'd to any events yet."
                        : `No ${filter} events.`}
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href="/events">Browse Events</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            {tickets.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {tickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="overflow-hidden border-2 transition-all hover:border-primary/20"
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center">
                        <div className="flex h-full w-24 flex-col items-center justify-center border-r bg-primary/5 p-4">
                          <span className="text-xs font-bold uppercase text-muted-foreground">
                            {new Date(
                              ticket.event.starts_at
                            ).toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span className="text-2xl font-black">
                            {new Date(ticket.event.starts_at).getDate()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 p-4">
                          <h4 className="truncate text-sm font-bold">
                            {ticket.event.title}
                          </h4>
                          <p className="mb-2 text-xs text-muted-foreground">
                            {ticket.currency} {ticket.unit_price} •{" "}
                            {ticket.quantity} qty
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-bold"
                            >
                              {ticket.status}
                            </Badge>
                            {ticket.checked_in_at && (
                              <Badge className="bg-green-500 text-[10px] text-white">
                                Checked In
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="border-l p-4">
                          <Button
                            size="icon"
                            variant="outline"
                            asChild
                            className="h-10 w-10"
                          >
                            <Link href={`/dashboard/tickets/${ticket.id}`}>
                              <QrCode className="h-5 w-5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <TicketIcon className="mx-auto mb-2 h-12 w-12 text-muted-foreground/30" />
                  <h3 className="font-medium text-muted-foreground">
                    No paid tickets found
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    You haven&apos;t purchased any tickets for paid events yet.
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/events">Find Paid Events</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </UserDashboardShell>
  )
}
