"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { labBookingsAdminApi, labSpacesAdminApi } from "@/lib/api-admin"
import { useAuth } from "@/store/auth"
import { format, parseISO, isPast } from "date-fns"
import Swal from "sweetalert2"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Unauthorized } from "@/components/unauthorized"
import { 
  MoreHorizontal,
  Check, 
  X, 
  LogIn, 
  LogOut,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  FlaskConical,
  Loader2,
  Search,
  ExternalLink,
} from "lucide-react"
import type { LabBooking, LabBookingStatus } from "@/types/lab"

const STATUS_COLORS: Record<LabBookingStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  approved: "bg-green-500/20 text-green-700 border-green-500/30",
  rejected: "bg-red-500/20 text-red-700 border-red-500/30",
  cancelled: "bg-gray-500/20 text-gray-700 border-gray-500/30",
  completed: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  no_show: "bg-orange-500/20 text-orange-700 border-orange-500/30",
}

export default function AdminLabBookingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [spaceFilter, setSpaceFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; booking: LabBooking | null }>({
    open: false,
    booking: null,
  })
  const [rejectionReason, setRejectionReason] = useState("")

  // Fetch bookings
  const { data: bookingsData, isLoading, error } = useQuery({
    queryKey: ["admin-lab-bookings", statusFilter, spaceFilter],
    queryFn: async () => {
      const params: any = { per_page: 50 }
      if (statusFilter !== "all") params.status = statusFilter
      if (spaceFilter !== "all") params.lab_space_id = parseInt(spaceFilter)
      const res = await labBookingsAdminApi.list(params)
      return res.data
    },
  })

  // Fetch spaces for filter
  const { data: spacesData } = useQuery({
    queryKey: ["admin-lab-spaces-filter"],
    queryFn: async () => {
      const res = await labSpacesAdminApi.list({ per_page: 50 })
      return res.data
    },
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: number) => labBookingsAdminApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lab-bookings"] })
      toast.success("Booking approved!")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to approve booking")
    },
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      labBookingsAdminApi.reject(id, { rejection_reason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lab-bookings"] })
      toast.success("Booking rejected")
      setRejectDialog({ open: false, booking: null })
      setRejectionReason("")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reject booking")
    },
  })

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (id: number) => labBookingsAdminApi.checkIn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lab-bookings"] })
      toast.success("User checked in!")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to check in")
    },
  })

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: (id: number) => labBookingsAdminApi.checkOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lab-bookings"] })
      toast.success("User checked out!")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to check out")
    },
  })

  // No-show mutation
  const noShowMutation = useMutation({
    mutationFn: (id: number) => labBookingsAdminApi.markNoShow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lab-bookings"] })
      toast.success("Marked as no-show")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to mark no-show")
    },
  })

  const bookings = bookingsData || []
  const spaces = spacesData || []

  // Filter by search
  const filteredBookings = bookings.filter((b) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      b.user?.name?.toLowerCase().includes(searchLower) ||
      b.user?.email?.toLowerCase().includes(searchLower) ||
      b.title?.toLowerCase().includes(searchLower) ||
      b.lab_space?.name?.toLowerCase().includes(searchLower)
    )
  })

  const handleApprove = async (booking: LabBooking) => {
    const result = await Swal.fire({
      title: "Approve Booking",
      text: `Approve booking for ${booking.user?.name || "user"}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
      confirmButtonColor: "#22c55e",
    })

    if (result.isConfirmed) {
      await approveMutation.mutateAsync(booking.id)
    }
  }

  const handleReject = (booking: LabBooking) => {
    setRejectDialog({ open: true, booking })
    setRejectionReason("")
  }

  const submitRejection = async () => {
    if (!rejectDialog.booking || !rejectionReason.trim()) return
    await rejectMutation.mutateAsync({
      id: rejectDialog.booking.id,
      reason: rejectionReason.trim(),
    })
  }

  const handleCheckIn = async (booking: LabBooking) => {
    await checkInMutation.mutateAsync(booking.id)
  }

  const handleCheckOut = async (booking: LabBooking) => {
    await checkOutMutation.mutateAsync(booking.id)
  }

  const handleNoShow = async (booking: LabBooking) => {
    const result = await Swal.fire({
      title: "Mark as No-Show",
      text: `Mark ${booking.user?.name || "user"} as a no-show for this booking?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Mark No-Show",
      confirmButtonColor: "#f97316",
    })

    if (result.isConfirmed) {
      await noShowMutation.mutateAsync(booking.id)
    }
  }

  // Authorization check
  const canView = user?.ui_permissions?.can_view_lab_bookings
  const canApprove = user?.ui_permissions?.can_approve_lab_bookings
  const canMarkAttendance = user?.ui_permissions?.can_mark_lab_attendance

  if (authLoading) {
    return (
      <AdminDashboardShell title="Lab Bookings">
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AdminDashboardShell>
    )
  }

  if (!canView) {
    return <Unauthorized actionHref="/admin" />
  }

  return (
    <AdminDashboardShell title="Lab Bookings">
      <div className="space-y-4">
        {/* Header Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Lab Bookings Management
                </CardTitle>
                <CardDescription>
                  Review, approve, and manage lab space bookings
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {filteredBookings.filter((b) => b.status === "pending").length} pending
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Filters Card */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, title, or space..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Space Filter */}
              <Select value={spaceFilter} onValueChange={setSpaceFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Lab Space" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Spaces</SelectItem>
                  {spaces.map((space) => (
                    <SelectItem key={space.id} value={String(space.id)}>
                      {space.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">
                Failed to load bookings
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No bookings found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Lab Space</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => {
                      const startsAt = parseISO(booking.starts_at)
                      const endsAt = parseISO(booking.ends_at)
                      const isUpcoming = !isPast(startsAt)
                      const canActOnBooking = booking.status === "pending" || booking.status === "approved"

                      return (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {booking.user?.name || "Unknown"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {booking.user?.email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FlaskConical className="h-4 w-4 text-muted-foreground" />
                              {booking.lab_space?.name || "Unknown"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{format(startsAt, "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(startsAt, "h:mm a")} - {format(endsAt, "h:mm a")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              {booking.duration_hours}h
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${STATUS_COLORS[booking.status]} border`}>
                              {booking.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {/* Pending actions */}
                                {booking.status === "pending" && canApprove && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleApprove(booking)}>
                                      <Check className="h-4 w-4 mr-2 text-green-600" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleReject(booking)}>
                                      <X className="h-4 w-4 mr-2 text-red-600" />
                                      Reject
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}

                                {/* Approved + Upcoming actions */}
                                {booking.status === "approved" && isUpcoming && canMarkAttendance && (
                                  <>
                                    {!booking.checked_in_at ? (
                                      <DropdownMenuItem onClick={() => handleCheckIn(booking)}>
                                        <LogIn className="h-4 w-4 mr-2" />
                                        Check In
                                      </DropdownMenuItem>
                                    ) : !booking.checked_out_at ? (
                                      <DropdownMenuItem onClick={() => handleCheckOut(booking)}>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Check Out
                                      </DropdownMenuItem>
                                    ) : null}
                                    <DropdownMenuItem onClick={() => handleNoShow(booking)}>
                                      <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                                      Mark No-Show
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}

                                {/* View space link */}
                                {booking.lab_space && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/spaces/${booking.lab_space.slug}`}>
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      View Space
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => {
        if (!open) setRejectDialog({ open: false, booking: null })
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this booking. The user will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {rejectDialog.booking && (
              <div className="p-3 rounded-lg bg-muted text-sm">
                <div><strong>User:</strong> {rejectDialog.booking.user?.name}</div>
                <div><strong>Space:</strong> {rejectDialog.booking.lab_space?.name}</div>
                <div>
                  <strong>Date:</strong>{" "}
                  {format(parseISO(rejectDialog.booking.starts_at), "MMM d, yyyy h:mm a")}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this booking is being rejected..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false, booking: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitRejection}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Reject Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminDashboardShell>
  )
}
