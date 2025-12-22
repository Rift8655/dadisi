"use client"

import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { EventForm } from "@/components/event-form/EventForm"

export default function CreateEventPage() {
  return (
    <UserDashboardShell title="Create Event">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Fill in the details below to create a new event. You can save as draft and publish later.
          </p>
        </div>
        <EventForm />
      </div>
    </UserDashboardShell>
  )
}
