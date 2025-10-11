"use client"

import fs from "node:fs"
import path from "node:path"
import { useMemo, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRsvpStore } from "@/store/useRsvpStore"

function useEvents() {
  const file = path.join(process.cwd(), "public/data/events.json")
  const raw = fs.readFileSync(file, "utf8")
  return JSON.parse(raw) as Array<{
    id: number
    title: string
    type: string
    start_time: string
    end_time: string
    location: string
    description: string
    image: string
    rsvp_required: boolean
  }>
}

const views = ["Month", "Week", "Day"] as const

export default function EventsPage() {
  const events = useEvents()
  const [view, setView] = useState<(typeof views)[number]>("Month")
  const { rsvps, toggle } = useRsvpStore()

  const grouped = useMemo(() => {
    const byDay = events.reduce<Record<string, typeof events>>((acc, e) => {
      const day = new Date(e.start_time).toDateString()
      acc[day] = acc[day] || []
      acc[day].push(e)
      return acc
    }, {})
    return byDay
  }, [events])

  return (
    <div className="container py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-bold">Events</h1>
        <div className="flex gap-2">
          {views.map((v) => (
            <Button key={v} variant={v === view ? "default" : "outline"} onClick={() => setView(v)}>
              {v}
            </Button>
          ))}
        </div>
      </div>

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
                <Image src={e.image} alt={e.title} fill className="rounded-md object-cover" />
              </div>
              <p className="text-sm text-muted-foreground">{e.description}</p>
              <Button onClick={() => toggle(e.id)} variant={rsvps[e.id] ? "secondary" : "default"}>
                {rsvps[e.id] ? "RSVP’d" : "RSVP"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="mb-2 text-xl font-semibold">Special highlight</h2>
        {events.find((e) => e.title.includes("Citizen Science Engagement")) && (
          <p className="text-muted-foreground">Join our Citizen Science Engagement seminars to collaborate with communities across Kenya.</p>
        )}
      </div>
    </div>
  )
}
