"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Users,
  Star,
  ClipboardCheck,
  Search,
  ChevronDown,
  Eye,
  Check,
  X,
  Ban,
  Trash2,
  MoreVertical,
  Building,
  User,
  ArrowUpDown,
  Plus,
  Pencil,
  Send,
} from "lucide-react"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { useAuth } from "@/store/auth"
import { useAdminEvents, useAdminEventStats, useAdminEventMutations, type AdminEventFilters } from "@/hooks/useAdminEvents"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Swal from "sweetalert2"
import { formatDate } from "@/lib/utils"
import type { Event } from "@/types"

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { color: string; label: string }> = {
    draft: { color: "bg-gray-100 text-gray-700 border-gray-200", label: "Draft" },
    pending_approval: { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Pending" },
    published: { color: "bg-green-100 text-green-700 border-green-200", label: "Published" },
    rejected: { color: "bg-red-100 text-red-700 border-red-200", label: "Rejected" },
    cancelled: { color: "bg-gray-100 text-gray-500 border-gray-200", label: "Cancelled" },
    suspended: { color: "bg-orange-100 text-orange-700 border-orange-200", label: "Suspended" },
  }
  const v = variants[status] || variants.draft
  return <Badge variant="outline" className={v.color}>{v.label}</Badge>
}

// Event type badge
function EventTypeBadge({ type }: { type: string | undefined }) {
  if (type === "organization") {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
        <Building className="h-3 w-3" /> Dadisi
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 gap-1">
      <User className="h-3 w-3" /> User
    </Badge>
  )
}

// Stats card
function StatCard({ title, value, icon: Icon, loading }: { title: string; value: number; icon: any; loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminEventsPage() {
  const router = useRouter()
  const user = useAuth((s) => s.user)
  const isAuthLoading = useAuth((s) => s.isLoading)
  
  // Filters state
  const [filters, setFilters] = useState<AdminEventFilters>({
    status: "all",
    event_type: "all",
    search: "",
    upcoming: false,
    sort_by: "starts_at",
    sort_dir: "asc",
    page: 1,
    per_page: 20,
  })
  const [searchInput, setSearchInput] = useState("")
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Data queries
  const { data: eventsData, isLoading: eventsLoading, refetch } = useAdminEvents(filters)
  const { data: stats, isLoading: statsLoading } = useAdminEventStats()
  const mutations = useAdminEventMutations()

  // Handlers
  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }))
  }

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, status: value as any, page: 1 }))
  }

  const handleTypeFilter = (value: string) => {
    setFilters(prev => ({ ...prev, event_type: value as any, page: 1 }))
  }

  const handleRowsPerPage = (value: string) => {
    setFilters(prev => ({ ...prev, per_page: parseInt(value), page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleSort = (column: 'title' | 'starts_at' | 'status' | 'created_at') => {
    setFilters(prev => ({
      ...prev,
      sort_by: column,
      sort_dir: prev.sort_by === column && prev.sort_dir === 'asc' ? 'desc' : 'asc',
      page: 1
    }))
  }

  const SortableHeader = ({ label, column }: { label: string, column: 'title' | 'starts_at' | 'status' | 'created_at' }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`h-3 w-3 ${filters.sort_by === column ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
    </TableHead>
  )

  const toggleSelectAll = () => {
    const events = eventsData?.events || []
    if (selectedIds.length === events.length && events.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(events.map((e: Event) => e.id))
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // Action handlers (same as before)
  const handleApprove = async (id: number) => {
    try {
      await mutations.approve.mutateAsync(id)
      Swal.fire("Approved!", "Event has been approved and published.", "success")
    } catch (e) {
      Swal.fire("Error", "Failed to approve event.", "error")
    }
  }

  const handleReject = async (id: number) => {
    const result = await Swal.fire({
      title: "Reject Event",
      input: "textarea",
      inputLabel: "Reason for rejection (optional)",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Reject",
    })
    if (result.isConfirmed) {
      try {
        await mutations.reject.mutateAsync({ id, reason: result.value })
        Swal.fire("Rejected", "Event has been rejected.", "success")
      } catch (e) {
        Swal.fire("Error", "Failed to reject event.", "error")
      }
    }
  }

  const handlePublish = async (id: number) => {
    try {
      await mutations.publish.mutateAsync(id)
      Swal.fire("Published!", "Event is now live.", "success")
    } catch (e) {
      Swal.fire("Error", "Failed to publish event.", "error")
    }
  }

  const handleSuspend = async (id: number) => {
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
        await mutations.suspend.mutateAsync(id)
        Swal.fire("Suspended", "Event has been suspended.", "success")
      } catch (e) {
        Swal.fire("Error", "Failed to suspend event.", "error")
      }
    }
  }

  const handleFeature = async (id: number) => {
    try {
      await mutations.feature.mutateAsync({ id })
      Swal.fire("Featured!", "Event has been featured.", "success")
    } catch (e) {
      Swal.fire("Error", "Failed to feature event.", "error")
    }
  }

  const handleUnfeature = async (id: number) => {
    try {
      await mutations.unfeature.mutateAsync(id)
      Swal.fire("Unfeatured", "Event has been unfeatured.", "success")
    } catch (e) {
      Swal.fire("Error", "Failed to unfeature event.", "error")
    }
  }

  const handleDelete = async (id: number) => {
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
        await mutations.delete.mutateAsync(id)
        Swal.fire("Deleted", "Event has been deleted.", "success")
      } catch (e) {
        Swal.fire("Error", "Failed to delete event.", "error")
      }
    }
  }

  // Bulk actions
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return
    for (const id of selectedIds) {
      await mutations.approve.mutateAsync(id)
    }
    setSelectedIds([])
    Swal.fire("Success", `${selectedIds.length} events approved.`, "success")
  }

  const handleBulkSuspend = async () => {
    if (selectedIds.length === 0) return
    const result = await Swal.fire({
      title: `Suspend ${selectedIds.length} events?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
    })
    if (result.isConfirmed) {
      for (const id of selectedIds) {
        await mutations.suspend.mutateAsync(id)
      }
      setSelectedIds([])
      Swal.fire("Success", `${selectedIds.length} events suspended.`, "success")
    }
  }

  // Loading state
  if (isAuthLoading || !user) {
    return (
      <AdminDashboardShell title="Event Management">
        <div className="flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </AdminDashboardShell>
    )
  }

  const events = eventsData?.events || []
  const pagination = eventsData?.pagination

  return (
    <AdminDashboardShell 
      title="Event Management"
      actions={
        <Button onClick={() => router.push("/admin/events/create")}>
          <Plus className="h-4 w-4 mr-2" /> Create Event
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Events" value={stats?.total || 0} icon={Calendar} loading={statsLoading} />
          <StatCard title="Pending Review" value={stats?.pending_review || 0} icon={ClipboardCheck} loading={statsLoading} />
          <StatCard title="Upcoming" value={stats?.upcoming || 0} icon={Users} loading={statsLoading} />
          <StatCard title="Featured" value={stats?.featured || 0} icon={Star} loading={statsLoading} />
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>Manage all events, approve submissions, and moderate content.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              {/* Search */}
              <div className="flex gap-2 flex-1 min-w-[200px]">
                <Input
                  placeholder="Search by title..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="max-w-xs"
                />
                <Button variant="outline" size="icon" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Status filter */}
              <Select value={filters.status || "all"} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">Pending</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              {/* Type filter */}
              <Select value={filters.event_type || "all"} onValueChange={handleTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="organization">Dadisi Events</SelectItem>
                  <SelectItem value="user">User Events</SelectItem>
                </SelectContent>
              </Select>

              {/* Rows per page */}
              <Select value={String(filters.per_page || 20)} onValueChange={handleRowsPerPage}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="20">20 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <div className="flex gap-2 mb-4 p-2 bg-muted rounded-md">
                <span className="text-sm text-muted-foreground self-center">{selectedIds.length} selected</span>
                <Button size="sm" variant="outline" onClick={handleBulkApprove}>
                  <Check className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkSuspend}>
                  <Ban className="h-4 w-4 mr-1" /> Suspend
                </Button>
              </div>
            )}

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={events.length > 0 && selectedIds.length === events.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <SortableHeader label="Title" column="title" />
                    <TableHead>Type</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Created By</TableHead>
                    <SortableHeader label="Status" column="status" />
                    <SortableHeader label="Date" column="starts_at" />
                    <TableHead>Registrations</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        No events found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event: Event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(event.id)}
                            onCheckedChange={() => toggleSelect(event.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {event.title}
                          {event.featured && (
                            <Star className="h-3 w-3 text-yellow-500 inline ml-1" fill="currentColor" />
                          )}
                        </TableCell>
                        <TableCell>
                          <EventTypeBadge type={event.event_type} />
                        </TableCell>
                        <TableCell className="text-sm">
                          {(event as any).organizer?.username || (event as any).organizer?.email || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {(event as any).creator?.username || (event as any).creator?.email || "—"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={event.status} />
                        </TableCell>
                        <TableCell className="text-sm">
                          {event.starts_at ? formatDate(event.starts_at) : "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {(event as any).registrations_count ?? "—"}
                          {event.capacity && ` / ${event.capacity}`}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/admin/events/${event.id}`)}>
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/events/${event.id}/edit`)}>
                                <Pencil className="h-4 w-4 mr-2" /> Edit Event
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {event.status === "pending_approval" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleApprove(event.id)}>
                                    <Check className="h-4 w-4 mr-2" /> Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleReject(event.id)}>
                                    <X className="h-4 w-4 mr-2" /> Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {event.status === "draft" && (
                                <DropdownMenuItem onClick={() => handlePublish(event.id)}>
                                  <Send className="h-4 w-4 mr-2" /> Publish
                                </DropdownMenuItem>
                              )}
                              {event.featured ? (
                                <DropdownMenuItem onClick={() => handleUnfeature(event.id)}>
                                  <Star className="h-4 w-4 mr-2" /> Unfeature
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleFeature(event.id)}>
                                  <Star className="h-4 w-4 mr-2" /> Feature
                                </DropdownMenuItem>
                              )}
                              {event.status !== "suspended" && (
                                <DropdownMenuItem onClick={() => handleSuspend(event.id)}>
                                  <Ban className="h-4 w-4 mr-2" /> Suspend
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(event.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.last_page} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.last_page}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardShell>
  )
}
