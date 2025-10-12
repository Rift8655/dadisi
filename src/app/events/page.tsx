import path from "path"
import fs from "fs"
import { Button } from "@/components/ui/button"
import { EventsClient } from "@/components/events-client"

export const metadata = { title: "Events", description: "Workshops, seminars and expeditions" }

function getEvents() {
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

export default function EventsPage() {
  const events = getEvents()
  return (
    <div className="container py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-bold">Events</h1>
      </div>
      <EventsClient events={events} />
      <div className="mt-10">
        <h2 className="mb-2 text-xl font-semibold">Special highlight</h2>
        {events.find((e) => e.title.includes("Citizen Science Engagement")) && (
          <p className="text-muted-foreground">Join our Citizen Science Engagement seminars to collaborate with communities across Kenya.</p>
        )}
      </div>
    </div>
  )
}
