"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DollarSign,
  Search,
  Check,
  X,
  ArrowUpDown,
  MoreVertical,
  Eye,
  Loader2,
} from "lucide-react"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { useAuth } from "@/store/auth"
import { useAdminPayouts, useAdminPayoutMutations } from "@/hooks/useAdminPayouts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Swal from "sweetalert2"
import { formatDate } from "@/lib/utils"

// Status badge
function PayoutStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { color: string; label: string }> = {
    pending: { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Pending" },
    approved: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Approved" },
    completed: { color: "bg-green-100 text-green-700 border-green-200", label: "Completed" },
    rejected: { color: "bg-red-100 text-red-700 border-red-200", label: "Rejected" },
  }
  const v = variants[status] || variants.pending
  return <Badge variant="outline" className={v.color}>{v.label}</Badge>
}

export default function AdminPayoutsPage() {
  const router = useRouter()
  const user = useAuth((s) => s.user)
  const isAuthLoading = useAuth((s) => s.isLoading)
  
  // Filters
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  
  // Dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [selectedPayoutId, setSelectedPayoutId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [paymentReference, setPaymentReference] = useState("")

  // Data
  const { data, isLoading, refetch } = useAdminPayouts({ 
    status: status !== "all" ? status : undefined, 
    page,
    per_page: 20,
  })
  const mutations = useAdminPayoutMutations()

  // Handlers
  const handleApprove = async (id: number) => {
    try {
      await mutations.approve.mutateAsync(id)
      Swal.fire("Approved!", "Payout has been approved.", "success")
    } catch (e) {
      Swal.fire("Error", "Failed to approve payout.", "error")
    }
  }

  const openCompleteDialog = (id: number) => {
    setSelectedPayoutId(id)
    setPaymentReference("")
    setCompleteDialogOpen(true)
  }

  const handleComplete = async () => {
    if (!selectedPayoutId) return
    try {
      await mutations.complete.mutateAsync({ id: selectedPayoutId, reference: paymentReference })
      setCompleteDialogOpen(false)
      setSelectedPayoutId(null)
      Swal.fire("Completed!", "Payout has been marked as completed.", "success")
    } catch (e) {
      Swal.fire("Error", "Failed to complete payout.", "error")
    }
  }

  const openRejectDialog = (id: number) => {
    setSelectedPayoutId(id)
    setRejectReason("")
    setRejectDialogOpen(true)
  }

  const handleReject = async () => {
    if (!selectedPayoutId || !rejectReason) {
      Swal.fire("Error", "Please provide a rejection reason.", "error")
      return
    }
    try {
      await mutations.reject.mutateAsync({ id: selectedPayoutId, reason: rejectReason })
      setRejectDialogOpen(false)
      setSelectedPayoutId(null)
      Swal.fire("Rejected", "Payout has been rejected.", "success")
    } catch (e) {
      Swal.fire("Error", "Failed to reject payout.", "error")
    }
  }

  // Loading state
  if (isAuthLoading || !user) {
    return (
      <AdminDashboardShell title="Payouts Management">
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AdminDashboardShell>
    )
  }

  const payouts = data?.payouts || []
  const pagination = data?.pagination

  return (
    <AdminDashboardShell title="Payouts Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <DollarSign className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">—</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
              <Check className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">—</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <Check className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">—</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
              <X className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">—</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Requests</CardTitle>
            <CardDescription>Review and process organizer payout requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              {/* Status filter */}
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : payouts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No payout requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payouts.map((payout: any) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-mono text-sm">#{payout.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payout.organizer?.username || "—"}</p>
                            <p className="text-xs text-muted-foreground">{payout.organizer?.email || ""}</p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {payout.event?.title || "—"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {payout.currency} {payout.amount?.toLocaleString() || "—"}
                        </TableCell>
                        <TableCell>
                          <PayoutStatusBadge status={payout.status} />
                        </TableCell>
                        <TableCell className="text-sm">
                          {payout.created_at ? formatDate(payout.created_at) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/admin/payouts/${payout.id}`)}>
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {payout.status === "pending" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleApprove(payout.id)}>
                                    <Check className="h-4 w-4 mr-2" /> Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openRejectDialog(payout.id)}>
                                    <X className="h-4 w-4 mr-2" /> Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {payout.status === "approved" && (
                                <DropdownMenuItem onClick={() => openCompleteDialog(payout.id)}>
                                  <Check className="h-4 w-4 mr-2" /> Mark Complete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page || pagination.current_page} of {pagination.last_page} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.last_page}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payout</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this payout request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejectReason">Reason *</Label>
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
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>
              Reject Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payout</DialogTitle>
            <DialogDescription>
              Mark this payout as completed and optionally add a payment reference.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="paymentReference">Payment Reference (optional)</Label>
            <Input
              id="paymentReference"
              placeholder="e.g. Bank transfer ID..."
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleComplete}>
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminDashboardShell>
  )
}
