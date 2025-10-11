"use client"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRsvpStore } from "@/store/useRsvpStore"

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

export function EventsClient({ events }: { events: Event[] }) {
  const { rsvps, toggle } = useRsvpStore()
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((e) => (
        <Card key={e.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span>{e.title}</span>
              <span className="text-xs font-normal text-muted-foreground">{new Date(e.start_time).toLocaleDateString()} • {e.type}</span>
            </CardTitle>
            <CardDescription>{e.location}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video w-full">
              <Image src={e.image} alt={e.title} fill unoptimized className="rounded-md object-cover" />
            </div>
            <p className="text-sm text-muted-foreground">{e.description}</p>
            <Button onClick={() => toggle(e.id)} variant={rsvps[e.id] ? "secondary" : "default"}>
              {rsvps[e.id] ? "RSVP’d" : "RSVP"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
