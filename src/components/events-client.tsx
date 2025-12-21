"use client"

import { useState } from "react"
import Image from "next/image"
import { Calendar, Loader2 } from "lucide-react"
import { useEvents, useRsvp, RSVPDetails } from "@/hooks/useEvents"
import type { Event } from "@/schemas/event"

import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import RsvpDialog from "@/components/rsvp-dialog"
import Swal from "sweetalert2"

export function EventsClient() {
  const { data: response, isLoading } = useEvents()
  const events = response?.data || []
  const rsvpMut = useRsvp()
  
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<number | null>(null)

  const getStatus = (start: string, end?: string | null) => {
    const now = new Date()
    const s = new Date(start)
    const e = end ? new Date(end) : null

    if (now < s) return "Upcoming"
    if (e && now > e) return "Past"
    if (!e && now > new Date(s.getTime() + 3 * 3600 * 1000)) return "Past"
    return "Ongoing"
  }

  const onSubmit = async (details: RSVPDetails) => {
    if (activeId == null) return
    try {
      await rsvpMut.mutateAsync({
        id: activeId,
        payload: {
          name: details.name,
          email: details.email,
          guests: details.guests,
          note: details.note,
        }
      })
      Swal.fire("Success", "RSVP Confirmed!", "success")
      setOpen(false)
    } catch (error: unknown) {
      let message = "Failed to RSVP"
      if (typeof error === "object" && error !== null) {
        const e = error as { message?: string }
        message = e.message ?? message
      }
      Swal.fire("Error", message, "error")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <RsvpDialog open={open} onOpenChange={setOpen} onSubmit={onSubmit} />
      {events.map((e) => {
        const status = getStatus(e.starts_at, e.ends_at)
        const isPast = status === "Past"
        return (
          <Card key={e.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>{e.title}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {formatDate(e.starts_at)}
                </span>
              </CardTitle>
              <div className="flex items-center justify-between">
                <CardDescription>{e.venue || "Virtual"}</CardDescription>
                <span
                  className={
                    status === "Ongoing"
                      ? "ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground"
                      : status === "Upcoming"
                        ? "ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground"
                        : "ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  }
                >
                  {status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {e.image_url && (
                <div className="relative aspect-video w-full">
                  <Image
                    src={e.image_url}
                    alt={e.title}
                    fill
                    unoptimized
                    className="rounded-md object-cover"
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground line-clamp-3">{e.description}</p>
              {!e.is_attending ? (
                <Button
                  disabled={isPast || rsvpMut.isPending}
                  className="w-full"
                  onClick={() => {
                    setActiveId(e.id)
                    setOpen(true)
                  }}
                >
                  {rsvpMut.isPending && activeId === e.id ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                    </span>
                  ) : isPast ? (
                    "Closed"
                  ) : (
                    "RSVP Now"
                  )}
                </Button>
              ) : (
                <Button variant="secondary" className="w-full" disabled>
                  RSVP’d
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}
      {!isLoading && events.length === 0 && (
        <div className="col-span-full py-10 text-center text-muted-foreground">
           No upcoming events found.
        </div>
      )}
    </div>
  )
}
