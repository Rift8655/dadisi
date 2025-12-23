"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Video,
  Users,
  Star,
  Check,
  X,
  Ban,
  Trash2,
  Building,
  User,
  Mail,
  Clock,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { useAuth } from "@/store/auth"
import { useAdminEvent, useAdminEventMutations, useAdminEventRegistrations } from "@/hooks/useAdminEvents"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Swal from "sweetalert2"
import { formatDate } from "@/lib/utils"

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { color: string; label: string }> = {
    draft: { color: "bg-gray-100 text-gray-700 border-gray-200", label: "Draft" },
    pending_approval: { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Pending Approval" },
    published: { color: "bg-green-100 text-green-700 border-green-200", label: "Published" },
    rejected: { color: "bg-red-100 text-red-700 border-red-200", label: "Rejected" },
    cancelled: { color: "bg-gray-100 text-gray-500 border-gray-200", label: "Cancelled" },
    suspended: { color: "bg-orange-100 text-orange-700 border-orange-200", label: "Suspended" },
  }
  const v = variants[status] || variants.draft
  return <Badge variant="outline" className={`${v.color} text-sm px-3 py-1`}>{v.label}</Badge>
}

// Registrations Table Component
function RegistrationsTable({ eventId, waitlist = false }: { eventId: number; waitlist?: boolean }) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminEventRegistrations(eventId, { waitlist, page })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  const registrations = data?.registrations || []
  const pagination = data?.pagination

  if (registrations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-md border-dashed">
        No {waitlist ? "waitlisted users" : "registrations"} found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Ticket</TableHead>
              <TableHead>Status</TableHead>
              {waitlist && <TableHead>Position</TableHead>}
              <TableHead>Registered At</TableHead>
              <TableHead className="text-right">Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((reg: any) => (
              <TableRow key={reg.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{reg.user?.username || "—"}</span>
                    <span className="text-xs text-muted-foreground">{reg.user?.email || "—"}</span>
                  </div>
                </TableCell>
                <TableCell>{reg.ticket?.name || "Standard"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={reg.status === 'confirmed' ? 'bg-green-50 text-green-700' : ''}>
                    {reg.status}
                  </Badge>
                </TableCell>
                {waitlist && <TableCell>{reg.waitlist_position}</TableCell>}
                <TableCell className="text-sm">
                  {formatDate(reg.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  {reg.order_id && (
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                      View <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Basic Pagination for registrations (could be enhanced) */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.last_page}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Prev
            </Button>
            <Button size="sm" variant="outline" disabled={page === pagination.last_page} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminEventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params?.id ? parseInt(params.id as string) : null
  
  const user = useAuth((s) => s.user)
  const isAuthLoading = useAuth((s) => s.isLoading)
  
  const { data: event, isLoading } = useAdminEvent(eventId)
  const mutations = useAdminEventMutations()
  
  // Rejection dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  // Action handlers
  const handleApprove = async () => {
    if (!eventId) return
    try {
      await mutations.approve.mutateAsync(eventId)
      Swal.fire("Approved!", "Event has been approved and published.", "success")
    } catch (e) {
      Swal.fire("Error", "Failed to approve event.", "error")
    }
  }

  const handleReject = async () => {
    if (!eventId) return
    try {
      await mutations.reject.mutateAsync({ id: eventId, reason: rejectReason })
      setRejectDialogOpen(false)
      setRejectReason("")
      Swal.fire("Rejected", "Event has been rejected.", "success")
    } catch (e) {
      Swal.fire("Error", "Failed to reject event.", "error")
    }
  }

  const handlePublish = async () => {
    if (!eventId) return
    try {
      await mutations.publish.mutateAsync(eventId)
      Swal.fire("Published!", "Event is now live.", "success")
    } catch (e) {
      Swal.fire("Error", "Failed to publish event.", "error")
    }
  }

  const handleCancel = async () => {
    if (!eventId) return
    const result = await Swal.fire({
      title: "Cancel Event?",
      text: "This will cancel the event. Registered attendees may need to be notified.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Cancel Event",
    })
    if (result.isConfirmed) {
      try {
        await mutations.cancel.mutateAsync(eventId)
        Swal.fire("Cancelled", "Event has been cancelled.", "success")
      } catch (e) {
        Swal.fire("Error", "Failed to cancel event.", "error")
      }
    }
  }

  const handleSuspend = async () => {
    if (!eventId) return
    const result = await Swal.fire({
      title: "Suspend Event?",
      text: "This will hide the event from public view.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Suspend",
    })
    if (result.isConfirmed) {
      try {
        await mutations.suspend.mutateAsync(eventId)
        Swal.fire("Suspended", "Event has been suspended.", "success")
      } catch (e) {
        Swal.fire("Error", "Failed to suspend event.", "error")
      }
    }
  }

  const handleFeature = async () => {
    if (!eventId) return
    try {
      await mutations.feature.mutateAsync({ id: eventId })
      Swal.fire("Featured!", "Event has been featured.", "success")
    } catch (e) {
      Swal.fire("Error", "Failed to feature event.", "error")
    }
  }

  const handleUnfeature = async () => {
    if (!eventId) return
    try {
      await mutations.unfeature.mutateAsync(eventId)
      Swal.fire("Unfeatured", "Event has been unfeatured.", "success")
    } catch (e) {
      Swal.fire("Error", "Failed to unfeature event.", "error")
    }
  }

  const handleDelete = async () => {
    if (!eventId) return
    const result = await Swal.fire({
      title: "Delete Event?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Delete",
    })
    if (result.isConfirmed) {
      try {
        await mutations.delete.mutateAsync(eventId)
        Swal.fire("Deleted", "Event has been deleted.", "success")
        router.push("/admin/events")
      } catch (e) {
        Swal.fire("Error", "Failed to delete event.", "error")
      }
    }
  }

  // Loading state
  if (isAuthLoading || !user) {
    return (
      <AdminDashboardShell title="Event Details">
        <div className="flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading...
          </p>
        </div>
      </AdminDashboardShell>
    )
  }

  if (isLoading) {
    return (
      <AdminDashboardShell title="Event Details">
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </AdminDashboardShell>
    )
  }

  if (!event) {
    return (
      <AdminDashboardShell title="Event Details">
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Event not found.
            </CardContent>
          </Card>
        </div>
      </AdminDashboardShell>
    )
  }

  const organizer = (event as any).organizer
  const creator = (event as any).creator
  const registrationsCount = (event as any).registrations_count ?? 0

  return (
    <AdminDashboardShell title="Event Details">
      <div className="space-y-6">
        {/* Back button */}
        <Button variant="ghost" onClick={() => router.push("/admin/events")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
        </Button>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="registrations">Registrations ({registrationsCount})</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Event Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          {event.title}
                          {event.featured && (
                            <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <StatusBadge status={event.status} />
                          {(event as any).event_type === "organization" ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                              <Building className="h-3 w-3" /> Dadisi Event
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 gap-1">
                              <User className="h-3 w-3" /> User Event
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Description */}
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">{event.description || "No description provided."}</p>
                    </div>

                    <Separator />

                    {/* Event Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Starts</p>
                          <p className="text-sm text-muted-foreground">
                            {event.starts_at ? formatDate(event.starts_at) : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Ends</p>
                          <p className="text-sm text-muted-foreground">
                            {event.ends_at ? formatDate(event.ends_at) : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.is_online ? (
                          <Video className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{event.is_online ? "Online Event" : "Venue"}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.is_online ? (event.online_link || "—") : (event.venue || "—")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Registrations</p>
                          <p className="text-sm text-muted-foreground">
                            {registrationsCount} {event.capacity ? `/ ${event.capacity}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Category & County */}
                    <div className="flex gap-2 flex-wrap pt-2">
                      {(event as any).category && (
                        <Badge variant="secondary">{(event as any).category.name}</Badge>
                      )}
                      {(event as any).county && (
                        <Badge variant="outline">{(event as any).county.name}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Info (Speakers, Tickets) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tickets */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tickets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {event.tickets && event.tickets.length > 0 ? (
                        <div className="space-y-3">
                          {event.tickets.map((t: any) => (
                            <div key={t.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                              <div>
                                <p className="text-sm font-medium">{t.name}</p>
                                <p className="text-xs text-muted-foreground">{t.quantity || 'Unlimited'} qty</p>
                              </div>
                              <Badge>{t.price} {event.currency}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No ticket tiers defined.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Speakers */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Speakers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {event.speakers && event.speakers.length > 0 ? (
                        <div className="space-y-3">
                          {event.speakers.map((s: any) => (
                            <div key={s.id} className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
                                {s.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{s.name}</p>
                                <p className="text-xs text-muted-foreground">{s.designation || 'Speaker'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No speakers listed.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Sidebar: Actions & People */}
              <div className="space-y-6">
                {/* Actions Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {event.status === "pending_approval" && (
                      <>
                        <Button className="w-full" onClick={handleApprove}>
                          <Check className="h-4 w-4 mr-2" /> Approve & Publish
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => setRejectDialogOpen(true)}>
                          <X className="h-4 w-4 mr-2" /> Reject
                        </Button>
                      </>
                    )}
                    {event.status === "draft" && (
                      <Button className="w-full" onClick={handlePublish}>
                        Publish
                      </Button>
                    )}
                    {event.featured ? (
                      <Button variant="outline" className="w-full" onClick={handleUnfeature}>
                        <Star className="h-4 w-4 mr-2" /> Unfeature
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" onClick={handleFeature}>
                        <Star className="h-4 w-4 mr-2" /> Feature
                      </Button>
                    )}
                    {event.status === "published" && (
                      <Button variant="outline" className="w-full" onClick={handleCancel}>
                        Cancel Event
                      </Button>
                    )}
                    {event.status !== "suspended" && (
                      <Button variant="outline" className="w-full" onClick={handleSuspend}>
                        <Ban className="h-4 w-4 mr-2" /> Suspend
                      </Button>
                    )}
                    <Separator className="my-2" />
                    <Button variant="destructive" className="w-full" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Event
                    </Button>
                  </CardContent>
                </Card>

                {/* Organizer & Creator Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">People</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Organizer */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Organizer (Public)</p>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Building className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {organizer?.username || organizer?.email || "Dadisi Community Labs"}
                          </p>
                          {organizer?.email && (
                            <p className="text-xs text-muted-foreground">{organizer.email}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Creator */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Created By (Internal)</p>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {creator?.username || creator?.email || "—"}
                          </p>
                          {creator?.email && creator.username && (
                            <p className="text-xs text-muted-foreground">{creator.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="registrations">
            <Card>
              <CardHeader>
                <CardTitle>Event Registrations</CardTitle>
                <CardDescription>View and manage users registered for this event.</CardDescription>
              </CardHeader>
              <CardContent>
                {eventId && <RegistrationsTable eventId={eventId} />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waitlist">
            <Card>
              <CardHeader>
                <CardTitle>Waitlist</CardTitle>
                <CardDescription>Users on the waitlist for this event.</CardDescription>
              </CardHeader>
              <CardContent>
                {eventId && <RegistrationsTable eventId={eventId} waitlist />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Payouts</CardTitle>
                <CardDescription>Financial settlements for this event.</CardDescription>
              </CardHeader>
              <CardContent>
                {(event as any).payouts && (event as any).payouts.length > 0 ? (
                  <div className="space-y-4">
                     {/* Payout summary or list */}
                     <p className="text-sm">Manage payouts in the Finance section.</p>
                     <Button variant="outline" onClick={() => router.push('/admin/payouts')}>
                        Go to Payouts Manager
                     </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-md border-dashed">
                    No payouts records yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Event</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this event. This will be shared with the organizer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejectReason">Reason (optional)</Label>
            <Textarea
              id="rejectReason"
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminDashboardShell>
  )
}
