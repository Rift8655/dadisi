"use client"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRsvpStore, type RSVPDetails } from "@/store/useRsvpStore"
import { useMemo, useState } from "react"
import RsvpDialog from "@/components/rsvp-dialog"

type Event = {
  id: number
  title: string
  type: string
  start_time: string
  end_time: string
  location: string
  description: string
  image: string
  rsvp_required: boolean
}

function getStatus(start: string, end: string) {
  const now = new Date()
  const s = new Date(start)
  const e = new Date(end)
  if (now < s) return "Upcoming" as const
  if (now >= s && now <= e) return "Ongoing" as const
  return "Past" as const
}

export function EventsClient({ events }: { events: Event[] }) {
  const { rsvps, set, cancel } = useRsvpStore()
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<number | null>(null)

  const onSubmit = (details: RSVPDetails) => {
    if (activeId == null) return
    set(activeId, details)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <RsvpDialog open={open} onOpenChange={setOpen} onSubmit={onSubmit} />
      {events.map((e) => {
        const status = getStatus(e.start_time, e.end_time)
        const info = rsvps[e.id]
        const isPast = status === "Past"
        return (
          <Card key={e.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>{e.title}</span>
                <span className="text-xs font-normal text-muted-foreground">{new Date(e.start_time).toLocaleDateString()} • {e.type}</span>
              </CardTitle>
              <div className="flex items-center justify-between">
                <CardDescription>{e.location}</CardDescription>
                <span className={
                  status === "Ongoing"
                    ? "ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground"
                    : status === "Upcoming"
                    ? "ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground"
                    : "ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                }>{status}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video w-full">
                <Image src={e.image} alt={e.title} fill unoptimized className="rounded-md object-cover" />
              </div>
              <p className="text-sm text-muted-foreground">{e.description}</p>
              {!info ? (
                <Button
                  disabled={isPast}
                  onClick={() => { setActiveId(e.id); setOpen(true) }}
                >
                  {isPast ? "Closed" : "RSVP"}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="secondary">RSVP’d • {info.name}</Button>
                  <Button variant="outline" onClick={() => cancel(e.id)}>Cancel</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
