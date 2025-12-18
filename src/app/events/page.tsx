import { EventsClient } from "@/components/events-client"
import { PageShell } from "@/components/page-shell"

export const metadata = {
  title: "Events",
  description: "Workshops, seminars and expeditions",
}

export default function EventsPage() {
  return (
    <PageShell title="Events">
      <div className="space-y-8">
        <EventsClient />
        <div>
          <h2 className="mb-2 text-xl font-semibold">Special highlight</h2>
          <p className="text-muted-foreground">
            Check out our upcoming Citizen Science Engagement seminars!
          </p>
        </div>
      </div>
    </PageShell>
  )
}
