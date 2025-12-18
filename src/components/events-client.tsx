"use client"

import { useState } from "react"
import Image from "next/image"
import { useEvents, useRsvp } from "@/hooks/useEvents"
import type { Event } from "@/schemas/event"
import { RSVPDetails } from "@/store/useRsvpStore"

import { formatDate } from "@/lib/utils"
// import { showInfo } from "@/lib/sweetalert"
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

function getStatus(start: string, end?: string | null) {
  const now = new Date()
  const s = new Date(start)
  const e = end ? new Date(end) : new Date(s.getTime() + 2 * 60 * 60 * 1000) // default 2h
  if (now < s) return "Upcoming" as const
  if (now >= s && now <= e) return "Ongoing" as const
  return "Past" as const
}

export function EventsClient() {
  const { data: events = [], isLoading } = useEvents()
  const rsvpMut = useRsvp()
  
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<number | null>(null)

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
    return <div>Loading events...</div>
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
                <CardDescription>{e.location || "Virtual"}</CardDescription>
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
              {e.cover_image && (
                <div className="relative aspect-video w-full">
                  <Image
                    src={e.cover_image}
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
                  onClick={() => {
                    setActiveId(e.id)
                    setOpen(true)
                  }}
                >
                  {isPast ? "Closed" : "RSVP"}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" disabled>RSVP’d</Button>
                  {/* Cancel logic could be added here if API supports it */}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
      {!isLoading && events.length === 0 && (
        <div className="col-span-full py-10 text-center text-muted-foreground">
           No upcoming events.
        </div>
      )}
    </div>
  )
}
