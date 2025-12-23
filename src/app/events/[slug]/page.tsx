"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  Calendar,
  MapPin,
  Users,
  Globe,
  Clock,
  Share2,
  ArrowLeft,
  Ticket,
  CheckCircle2,
  User,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/store/auth"
import { useEvent, useRsvp, useValidatePromo } from "@/hooks/useEvents"
import type { Event, Ticket as TicketType, Speaker } from "@/types"
import { cn } from "@/lib/utils"
import Swal from "sweetalert2"

interface EventDetailPageProps {
  params: Promise<{ slug: string }>
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const isLocal = process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("localhost") || 
                  process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("127.0.0.1")
  const { slug } = use(params)
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  
  const [selectedTicket, setSelectedTicket] = useState<string>("")
  const [promoCode, setPromoCode] = useState("")
  const [promoDiscount, setPromoDiscount] = useState<{ type: string; value: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  const { data: event, isLoading, error } = useEvent(slug)

  // Prevent hydration mismatch by waiting for client mount
  useEffect(() => {
    setMounted(true)
  }, [])
  const validatePromoMutation = useValidatePromo()
  const rsvpMutation = useRsvp()


  const handleValidatePromo = () => {
    if (!event || !promoCode.trim() || !selectedTicket) return
    validatePromoMutation.mutate({ 
      eventId: event.id, 
      code: promoCode, 
      ticketId: parseInt(selectedTicket) 
    })
  }

  const handleRsvp = async () => {
    if (!event) return

    if (!isAuthenticated) {
      await Swal.fire({
        icon: "info",
        title: "Login Required",
        text: "Please log in to RSVP for this event.",
        confirmButtonText: "Go to Login",
      })
      router.push("/login?redirect=/events/" + slug)
      return
    }

    if (!selectedTicket) {
      await Swal.fire({
        icon: "warning",
        title: "Select a Ticket",
        text: "Please select a ticket type to continue.",
      })
      return
    }

    rsvpMutation.mutateAsync({ eventId: event.id, ticketId: parseInt(selectedTicket) })
      .then((rsvp) => {
        Swal.fire({
          icon: "success",
          title: "RSVP Successful!",
          html: `
            <p>You're confirmed for <strong>${event?.title}</strong></p>
            <p class="text-sm text-gray-500 mt-2">Confirmation: ${rsvp.confirmation_code}</p>
          `,
          confirmButtonText: "View My Tickets",
        })
        router.push("/dashboard/events")
      })
      .catch((err: any) => {
        Swal.fire({
          icon: "error",
          title: "RSVP Failed",
          text: err.message || "Something went wrong. Please try again.",
        })
      })
  }

  const calculatePrice = (ticketPrice: number): number => {
    if (!promoDiscount) return ticketPrice
    if (promoDiscount.type === "percentage") {
      return ticketPrice * (1 - promoDiscount.value / 100)
    }
    return Math.max(0, ticketPrice - promoDiscount.value)
  }

  const selectedTicketData = event?.tickets?.find(t => t.id.toString() === selectedTicket)

  if (!mounted || isLoading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-destructive mb-4">{(error as any).message || "Failed to load event"}</p>
        <Button onClick={() => router.push("/events")}>Back to Events</Button>
      </div>
    )
  }

  const eventDate = new Date(event.starts_at)
  const isPastEvent = eventDate < new Date()
  const isFreeEvent = !event.price || event.price === 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Back Button */}
      <div className="container max-w-6xl mx-auto px-4 py-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
      </div>

      <div className="container max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted shadow-lg">
              {event.image_url ? (
                <Image
                  src={event.image_url}
                  alt={event.title}
                  fill
                  unoptimized={isLocal}
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                  <Calendar className="h-20 w-20 text-primary/60" />
                </div>
              )}
              
              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {event.featured && (
                  <Badge className="bg-yellow-500 text-yellow-950">Featured</Badge>
                )}
                {isPastEvent && (
                  <Badge variant="secondary">Past Event</Badge>
                )}
              </div>
            </div>

            {/* Title & Category */}
            <div>
              {event.category && (
                <Badge variant="outline" className="mb-2">{event.category.name}</Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
              
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{format(eventDate, "EEEE, MMMM d, yyyy • h:mm a")}</span>
                </div>
                
                {event.is_online ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Globe className="h-5 w-5" />
                    <span>Online Event</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{event.venue || event.county?.name || "Location TBA"}</span>
                  </div>
                )}

                {event.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>{event.capacity} capacity</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">About This Event</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              </div>
            </div>

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Speakers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.speakers.map((speaker: Speaker) => (
                    <Card key={speaker.id} className="flex items-center p-4 gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {speaker.photo_url ? (
                          <Image
                            src={speaker.photo_url}
                            alt={speaker.name}
                            width={64}
                            height={64}
                            unoptimized={isLocal}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{speaker.name}</h3>
                        {speaker.designation && (
                          <p className="text-sm text-muted-foreground">{speaker.designation}</p>
                        )}
                        {speaker.company && (
                          <p className="text-sm text-muted-foreground">{speaker.company}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - RSVP */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>RSVP</span>
                    {isFreeEvent ? (
                      <Badge className="bg-green-500 text-white">Free</Badge>
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {event.currency} {selectedTicketData ? calculatePrice(selectedTicketData.price).toLocaleString() : event.price.toLocaleString()}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isPastEvent ? (
                    <div className="text-center py-4">
                      <Badge variant="secondary" className="mb-2">Event Ended</Badge>
                      <p className="text-sm text-muted-foreground">This event has already taken place.</p>
                    </div>
                  ) : (
                    <>
                      {/* Ticket Selection */}
                      {event.tickets && event.tickets.length > 0 && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Select Ticket</label>
                          <Select value={selectedTicket} onValueChange={setSelectedTicket}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a ticket type" />
                            </SelectTrigger>
                            <SelectContent>
                              {event.tickets.map((ticket: TicketType) => (
                                <SelectItem key={ticket.id} value={ticket.id.toString()} disabled={ticket.is_sold_out}>
                                  <div className="flex justify-between w-full gap-4">
                                    <span>{ticket.name}</span>
                                    <span className="text-muted-foreground">
                                      {ticket.price === 0 ? "Free" : `${event.currency} ${ticket.price.toLocaleString()}`}
                                    </span>
                                  </div>
                                  {ticket.is_sold_out && <Badge variant="destructive" className="ml-2">Sold Out</Badge>}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Promo Code */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Promo Code</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            disabled={!selectedTicket}
                          />
                          <Button
                            variant="outline"
                            onClick={handleValidatePromo}
                            disabled={!promoCode.trim() || !selectedTicket || validatePromoMutation.isPending}
                          >
                            {validatePromoMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                          </Button>
                        </div>
                        {promoDiscount && (
                          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            {promoDiscount.type === "percentage" ? `${promoDiscount.value}%` : `${promoDiscount.value}`} discount applied
                          </p>
                        )}
                      </div>

                      {/* RSVP Button */}
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleRsvp}
                        disabled={rsvpMutation.isPending || (!isFreeEvent && !selectedTicket)}
                      >
                        {rsvpMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Ticket className="h-4 w-4 mr-2" />
                        )}
                        {isAuthenticated ? "RSVP Now" : "Login to RSVP"}
                      </Button>

                      {event.waitlist_enabled && (
                        <p className="text-xs text-center text-muted-foreground">
                          If sold out, you'll be added to the waitlist
                        </p>
                      )}
                    </>
                  )}

                  <Separator />

                  {/* Share */}
                  <Button variant="outline" className="w-full" onClick={() => {
                    navigator.share?.({
                      title: event.title,
                      url: window.location.href,
                    }).catch(() => {
                      navigator.clipboard.writeText(window.location.href)
                      Swal.fire({ icon: "success", title: "Link copied!", timer: 1500, showConfirmButton: false })
                    })
                  }}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Event
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
