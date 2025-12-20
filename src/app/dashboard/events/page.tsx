"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { useAuth } from "@/store/auth"
import { eventsApi } from "@/lib/api"

interface UserEvent {
  id: number
  title: string
  description?: string
  starts_at: string
  ends_at?: string
  venue?: string
  is_online: boolean
  status: "upcoming" | "ongoing" | "past"
  rsvp_status: "confirmed" | "waitlist" | "cancelled"
  ticket_url?: string
  is_paid: boolean
  price?: number
  currency?: string
}

export default function EventsPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all")

  const { data: events = [], isLoading: loading } = useQuery({
    queryKey: ["user-events"],
    queryFn: async () => {
      const eventsData = await eventsApi.list({ page: 1 })
      const eventsList = Array.isArray(eventsData) ? eventsData : []
      
      const now = new Date()
      return eventsList.map((e: any) => {
        const startsAt = new Date(e.starts_at)
        const endsAt = e.ends_at ? new Date(e.ends_at) : null
        
        let status: "upcoming" | "ongoing" | "past" = "upcoming"
        if (endsAt && now > endsAt) {
          status = "past"
        } else if (now >= startsAt && (!endsAt || now <= endsAt)) {
          status = "ongoing"
        }
        
        return {
          id: e.id,
          title: e.title,
          description: e.description,
          starts_at: e.starts_at,
          ends_at: e.ends_at,
          venue: e.venue,
          is_online: e.is_online || false,
          status,
          rsvp_status: "confirmed" as const, // Would come from user's RSVP data
          ticket_url: e.ticket_url,
          is_paid: e.price && e.price > 0,
          price: e.price,
          currency: e.currency || "KES",
        } as UserEvent
      })
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-500/10 text-blue-600">Upcoming</Badge>
      case "ongoing":
        return <Badge className="bg-green-500/10 text-green-600">In Progress</Badge>
      case "past":
        return <Badge variant="secondary">Past</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRsvpBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500/10 text-green-600">Confirmed</Badge>
      case "waitlist":
        return <Badge className="bg-yellow-500/10 text-yellow-600">Waitlist</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-600">Cancelled</Badge>
      default:
        return null
    }
  }

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true
    if (filter === "upcoming") return event.status === "upcoming" || event.status === "ongoing"
    if (filter === "past") return event.status === "past"
    return true
  })

  return (
    <UserDashboardShell title="My Events">
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
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Events you&apos;ve registered for</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {events.filter(e => e.status === "upcoming" || e.status === "ongoing").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Events to attend</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Attended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{events.filter(e => e.status === "past").length}</p>
              <p className="text-xs text-muted-foreground mt-1">Past events</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
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
              {tab === "all" ? "All Events" : tab}
            </button>
          ))}
        </div>

        {/* Events List */}
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
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Date Column */}
                    <div className="flex-shrink-0 bg-primary/5 p-6 text-center md:w-32">
                      <p className="text-sm font-medium text-muted-foreground">
                        {new Date(event.starts_at).toLocaleDateString("en-US", { month: "short" })}
                      </p>
                      <p className="text-3xl font-bold">
                        {new Date(event.starts_at).getDate()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(event.starts_at)}
                      </p>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold">{event.title}</h3>
                            {getStatusBadge(event.status)}
                            {getRsvpBadge(event.rsvp_status)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {event.is_online ? "Online Event" : event.venue || "TBA"}
                            </span>
                            {event.is_paid && (
                              <span className="flex items-center gap-1">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatCurrency(event.price || 0, event.currency || "KES")}
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {event.is_paid && event.ticket_url && event.status !== "past" && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                                View Ticket
                              </a>
                            </Button>
                          )}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/events/${event.id}`}>Details</Link>
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
                <h3 className="mt-4 font-medium">No events found</h3>
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
      </div>
    </UserDashboardShell>
  )
}
