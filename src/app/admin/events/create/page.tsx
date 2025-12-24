"use client"

import { useRouter } from "next/navigation"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { EventForm } from "@/components/event-form/EventForm"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function AdminEventCreatePage() {
  const router = useRouter()

  return (
    <AdminDashboardShell 
      title="Create Organization Event"
      actions={
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      }
    >
      <div className="max-w-5xl mx-auto">
        <EventForm isAdmin={true} />
      </div>
    </AdminDashboardShell>
  )
}
