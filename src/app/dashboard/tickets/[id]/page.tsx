"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  QrCode, 
  Loader2, 
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink
} from "lucide-react"
import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"

import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { eventOrdersApi } from "@/lib/api"

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  paid: { label: "Confirmed", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  pending: { label: "Pending Payment", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", icon: XCircle },
  refunded: { label: "Refunded", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: RefreshCw },
}

export default function TicketDetailPage() {
  const params = useParams()
  const ticketId = Number(params.id)
  const [copied, setCopied] = useState(false)

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      const response = await eventOrdersApi.get(ticketId)
      return response.data
    },
    enabled: !!ticketId,
  })

  const handleCopyCode = async () => {
    if (ticket?.qr_code_token) {
      await navigator.clipboard.writeText(ticket.qr_code_token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <DashboardShell title="Ticket Details">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  if (error || !ticket) {
    return (
      <DashboardShell title="Ticket Details">
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Ticket Not Found</h3>
            <p className="text-muted-foreground mb-4">
              This ticket may have been cancelled or doesn't exist.
            </p>
            <Button asChild>
              <Link href="/dashboard/tickets">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tickets
              </Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardShell>
    )
  }

  const eventDate = new Date(ticket.event.starts_at)
  const isPastEvent = eventDate < new Date()
  const status = statusConfig[ticket.status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <DashboardShell title="Ticket Details">
      <div className="space-y-6">
        {/* Back Button */}
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/dashboard/tickets">
            <ArrowLeft className="h-4 w-4" />
            Back to Tickets
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Ticket Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={status.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                  {ticket.checked_in_at && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Checked In
                    </Badge>
                  )}
                  {isPastEvent && <Badge variant="outline">Past Event</Badge>}
                </div>
                <CardTitle className="text-2xl">{ticket.event.title}</CardTitle>
                <CardDescription>
                  Order Reference: <span className="font-mono">{ticket.reference}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {eventDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">
                        {eventDate.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  {ticket.event.venue && (
                    <div className="flex items-center gap-3 sm:col-span-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Venue</p>
                        <p className="font-medium">{ticket.event.venue}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div>
                  <h4 className="font-medium mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {ticket.quantity}x Ticket @ {ticket.currency} {ticket.unit_price}
                      </span>
                      <span>{ticket.currency} {ticket.original_amount}</span>
                    </div>
                    {ticket.promo_discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Promo Discount {ticket.promo_code && `(${ticket.promo_code})`}</span>
                        <span>-{ticket.currency} {ticket.promo_discount}</span>
                      </div>
                    )}
                    {ticket.subscriber_discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Subscriber Discount</span>
                        <span>-{ticket.currency} {ticket.subscriber_discount}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total Paid</span>
                      <span>{ticket.currency} {ticket.total_amount}</span>
                    </div>
                  </div>
                </div>

                {ticket.checked_in_at && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>
                        Checked in on{" "}
                        {new Date(ticket.checked_in_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/events/${ticket.event.slug}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Event Page
              </Link>
            </Button>
          </div>

          {/* QR Code Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Your Ticket
                </CardTitle>
                <CardDescription>
                  Show this at the event entrance
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {ticket.status === 'paid' ? (
                  <>
                    <div className="p-4 bg-white rounded-xl shadow-inner border-2 border-primary/10 inline-block mx-auto animate-in zoom-in-95 duration-500">
                      <QRCodeSVG
                        value={ticket.qr_code_token}
                        size={180}
                        level="H"
                        includeMargin={false}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Ticket Code</p>
                      <div className="flex items-center justify-center gap-2">
                        <code className="text-lg font-mono bg-muted px-3 py-1 rounded">
                          {ticket.qr_code_token}
                        </code>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={handleCopyCode}
                          className="h-8 w-8"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Present this code at the event entrance for check-in
                    </p>
                  </>
                ) : (
                  <div className="py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {ticket.status === 'pending' 
                        ? "Complete payment to receive your ticket"
                        : "This ticket is no longer valid"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
