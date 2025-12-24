"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ChevronLeft, Loader2 } from "lucide-react"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { EventForm } from "@/components/event-form/EventForm"
import { Button } from "@/components/ui/button"
import { eventsAdminApi } from "@/lib/api-admin"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function AdminEventEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const eventId = Number(id)

  // Fetch event data
  const { data: event, isLoading, error } = useQuery({
    queryKey: ["admin-event", eventId],
    queryFn: async () => {
      const response = await eventsAdminApi.get(eventId)
      // API returns { data: event } - extract the event
      const eventData = response?.data || response
      console.log("[Edit Page] Event data:", eventData)
      return eventData
    },
    enabled: !!eventId,
  })

  if (isLoading) {
    return (
      <AdminDashboardShell
        title="Edit Event"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        }
      >
        <div className="max-w-5xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminDashboardShell>
    )
  }

  if (error || !event) {
    return (
      <AdminDashboardShell
        title="Edit Event"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        }
      >
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Event not found or you don't have permission to edit it.
              </p>
              <Button className="mt-4" onClick={() => router.push("/admin/events")}>
                Back to Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminDashboardShell>
    )
  }

  return (
    <AdminDashboardShell
      title={`Edit: ${event.title}`}
      actions={
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      }
    >
      <div className="max-w-5xl mx-auto">
        <EventForm initialData={event} isEdit={true} isAdmin={true} />
      </div>
    </AdminDashboardShell>
  )
}
