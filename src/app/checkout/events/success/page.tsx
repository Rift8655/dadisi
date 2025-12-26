"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Ticket, Calendar, MapPin, QrCode, Loader2, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { eventOrdersApi } from "@/lib/api"

interface TicketData {
  status: string
  paid: boolean
  qr_code_token?: string
  event: {
    id: number
    title: string
    starts_at: string
  }
}

function EventCheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")
  
  const [loading, setLoading] = useState(true)
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!reference) {
      setError("No order reference provided")
      setLoading(false)
      return
    }

    const checkStatus = async () => {
      try {
        const response = await eventOrdersApi.checkStatus(reference)
        if (response.success && response.data) {
          setTicket(response.data)
        } else {
          setError("Could not find your order")
        }
      } catch (err) {
        setError("Failed to verify your purchase")
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [reference])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying your purchase...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Something went wrong</CardTitle>
            <CardDescription>{error || "Unable to load ticket information"}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild variant="outline">
              <Link href="/events">Back to Events</Link>
            </Button>
            <Button asChild>
              <Link href="/support">Contact Support</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const eventDate = new Date(ticket.event.starts_at)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-green-600 dark:text-green-400">
            Purchase Successful!
          </CardTitle>
          <CardDescription>
            Your ticket has been confirmed. Check your email for details.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Event Details */}
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-lg">{ticket.event.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {eventDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {eventDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* QR Code Token */}
          {ticket.qr_code_token && (
            <div className="rounded-lg border p-4 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <QrCode className="h-4 w-4" />
                <span>Your Ticket Code</span>
              </div>
              <div className="font-mono text-lg bg-muted px-4 py-2 rounded">
                {ticket.qr_code_token}
              </div>
              <p className="text-xs text-muted-foreground">
                Show this code at the event entrance for check-in
              </p>
            </div>
          )}

          {/* Order Reference */}
          <div className="text-center text-sm text-muted-foreground">
            Order Reference: <span className="font-mono">{reference}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/dashboard/tickets">
                <Ticket className="mr-2 h-4 w-4" />
                View My Tickets
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/events">
                Browse More Events
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function EventCheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <EventCheckoutSuccessContent />
    </Suspense>
  )
}
