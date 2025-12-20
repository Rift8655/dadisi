"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { EventForm } from "@/components/event-form/EventForm"
import { eventsApi } from "@/lib/api"
import type { Event } from "@/types"

interface EditEventPageProps {
  params: Promise<{ slug: string }>
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const { slug } = use(params)
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEvent()
  }, [slug])

  const loadEvent = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await eventsApi.get(slug)
      setEvent(response as Event)
    } catch (err: any) {
      setError(err.message || "Failed to load event")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <UserDashboardShell title="Edit Event">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </UserDashboardShell>
    )
  }

  if (error || !event) {
    return (
      <UserDashboardShell title="Edit Event">
        <div className="text-center py-12">
          <p className="text-destructive">{error || "Event not found"}</p>
        </div>
      </UserDashboardShell>
    )
  }

  return (
    <UserDashboardShell title={`Edit: ${event.title}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Update the event details below. Changes will be saved when you submit.
          </p>
        </div>
        <EventForm initialData={event} isEdit />
      </div>
    </UserDashboardShell>
  )
}
