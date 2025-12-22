"use client"

import { useState } from "react"
import Link from "next/link"
import { format, parseISO, isPast } from "date-fns"
import { 
  useLabBookings, 
  useLabQuota, 
  useCancelLabBooking,
  BOOKING_STATUS_COLORS,
  formatQuotaStatus,
} from "@/hooks/useLabBookings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  FlaskConical,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Plus,
} from "lucide-react"
import type { LabBooking, LabBookingStatus } from "@/types/lab"

const STATUS_ICONS: Record<LabBookingStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  approved: <CheckCircle2 className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
  completed: <CheckCircle2 className="h-4 w-4" />,
  no_show: <AlertCircle className="h-4 w-4" />,
}

export default function DashboardBookingsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "all">("upcoming")
  
  // Fetch bookings based on tab
  const { data: bookings, isLoading, error } = useLabBookings({
    upcoming: activeTab === "upcoming" ? true : undefined,
  })

  // Fetch quota
  const { data: quota } = useLabQuota()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Lab Bookings</h1>
            <p className="text-muted-foreground">
              Manage your lab space reservations
            </p>
          </div>
          <Button asChild>
            <Link href="/spaces">
              <Plus className="h-4 w-4 mr-2" />
              Book a Space
            </Link>
          </Button>
        </div>

        {/* Quota Card */}
        {quota && (
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <FlaskConical className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Lab Hours</p>
                    <p className="font-semibold">{formatQuotaStatus(quota)}</p>
                  </div>
                </div>
                {quota.resets_at && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Resets</p>
                    <p className="text-sm font-medium">
                      {format(parseISO(quota.resets_at), "MMM d")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upcoming" | "all")}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="all">All Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            <BookingsList 
              bookings={bookings} 
              isLoading={isLoading} 
              error={error}
              emptyMessage="No upcoming bookings. Book a lab space to get started!"
            />
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <BookingsList 
              bookings={bookings} 
              isLoading={isLoading} 
              error={error}
              emptyMessage="You haven't made any bookings yet."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Bookings List Component
function BookingsList({ 
  bookings, 
  isLoading, 
  error,
  emptyMessage 
}: { 
  bookings?: LabBooking[]
  isLoading: boolean
  error: Error | null
  emptyMessage: string
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Failed to load bookings</h3>
        <p className="text-muted-foreground">Please try again later.</p>
      </Card>
    )
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No bookings</h3>
        <p className="text-muted-foreground mb-4">{emptyMessage}</p>
        <Button asChild>
          <Link href="/spaces">Browse Lab Spaces</Link>
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  )
}

// Single Booking Card
function BookingCard({ booking }: { booking: LabBooking }) {
  const cancelBooking = useCancelLabBooking()
  const [cancelling, setCancelling] = useState(false)
  
  const statusIcon = STATUS_ICONS[booking.status]
  const statusColor = BOOKING_STATUS_COLORS[booking.status]
  const startsAt = parseISO(booking.starts_at)
  const endsAt = parseISO(booking.ends_at)
  const isUpcoming = !isPast(startsAt)

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await cancelBooking.mutateAsync(booking.id)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Date Box */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary">
              <span className="text-xs uppercase font-medium">
                {format(startsAt, "MMM")}
              </span>
              <span className="text-2xl font-bold leading-tight">
                {format(startsAt, "d")}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold truncate">
                {booking.title || booking.lab_space?.name || "Lab Booking"}
              </h3>
              <Badge className={`${statusColor} border flex-shrink-0`}>
                {statusIcon}
                <span className="ml-1 capitalize">{booking.status}</span>
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(startsAt, "h:mm a")} - {format(endsAt, "h:mm a")}
              </span>
              {booking.lab_space && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {booking.lab_space.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <FlaskConical className="h-3.5 w-3.5" />
                {booking.duration_hours}h booked
              </span>
            </div>

            {booking.purpose && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                {booking.purpose}
              </p>
            )}

            {/* Rejection reason */}
            {booking.status === "rejected" && booking.rejection_reason && (
              <div className="mt-2 p-2 rounded bg-destructive/10 text-destructive text-sm">
                <strong>Reason:</strong> {booking.rejection_reason}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-2">
            {booking.lab_space && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/spaces/${booking.lab_space.slug}`}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  View Space
                </Link>
              </Button>
            )}
            
            {booking.is_cancellable && isUpcoming && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel your booking for {booking.lab_space?.name} on{" "}
                      {format(startsAt, "MMMM d, yyyy")}. Your quota will be refunded.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {cancelling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Yes, Cancel Booking
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
