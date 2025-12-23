"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  QrCode, 
  Loader2, 
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw
} from "lucide-react"

import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { eventOrdersApi, TicketOrder } from "@/lib/api"

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  paid: { label: "Confirmed", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", icon: XCircle },
  refunded: { label: "Refunded", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: RefreshCw },
}

function TicketCard({ ticket }: { ticket: TicketOrder }) {
  const eventDate = new Date(ticket.event.starts_at)
  const isPastEvent = eventDate < new Date()
  const status = statusConfig[ticket.status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <Card className={`hover:shadow-md transition-shadow ${isPastEvent ? 'opacity-75' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
              {ticket.checked_in_at && (
                <Badge variant="outline" className="text-green-600">
                  Checked In
                </Badge>
              )}
              {isPastEvent && (
                <Badge variant="outline">Past Event</Badge>
              )}
            </div>
            
            <h3 className="font-semibold text-lg truncate">{ticket.event.title}</h3>
            
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {eventDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {eventDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {ticket.event.venue && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate max-w-[150px]">{ticket.event.venue}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm">
              <span>
                <strong>{ticket.quantity}</strong> ticket{ticket.quantity > 1 ? 's' : ''}
              </span>
              <span className="text-muted-foreground">•</span>
              <span>
                {ticket.currency} {ticket.total_amount.toLocaleString()}
              </span>
              {ticket.promo_discount > 0 && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-green-600">
                    Saved {ticket.currency} {ticket.promo_discount.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {ticket.status === 'paid' && !isPastEvent && (
              <div className="text-center p-2 rounded-lg bg-muted">
                <QrCode className="h-8 w-8 mx-auto mb-1 text-muted-foreground" />
                <span className="text-xs font-mono">{ticket.qr_code_token?.slice(0, 8)}...</span>
              </div>
            )}
            <Button asChild size="sm" variant="ghost">
              <Link href={`/dashboard/tickets/${ticket.id}`}>
                View Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MyTicketsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-tickets", statusFilter],
    queryFn: async () => {
      const params = statusFilter !== "all" ? { status: statusFilter } : undefined
      const response = await eventOrdersApi.myTickets(params)
      return response.data
    },
  })

  const tickets = data || []
  const upcomingTickets = tickets.filter(t => 
    t.status === 'paid' && new Date(t.event.starts_at) >= new Date()
  )
  const pastTickets = tickets.filter(t => 
    t.status === 'paid' && new Date(t.event.starts_at) < new Date()
  )

  return (
    <DashboardShell title="My Tickets">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Upcoming Events</CardDescription>
              <CardTitle className="text-3xl">{upcomingTickets.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Past Events</CardDescription>
              <CardTitle className="text-3xl">{pastTickets.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Tickets</CardDescription>
              <CardTitle className="text-3xl">{tickets.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs for filtering */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="paid">Confirmed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="refunded">Refunded</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">Failed to load tickets</p>
                  <Button onClick={() => refetch()} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : tickets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tickets found</h3>
                  <p className="text-muted-foreground mb-4">
                    {statusFilter === "all" 
                      ? "You haven't purchased any event tickets yet."
                      : `No ${statusFilter} tickets found.`}
                  </p>
                  <Button asChild>
                    <Link href="/events">Browse Events</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
