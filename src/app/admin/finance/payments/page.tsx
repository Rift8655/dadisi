"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ExternalLink, Eye, Filter, RotateCcw, Search } from "lucide-react"
import { toast } from "sonner"

import type { AdminPayment } from "@/types/admin"
import { financeApi } from "@/lib/api-admin"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { PaymentDetailsDialog } from "@/components/admin/payment-details-dialog"

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [type, setType] = useState("all")
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  })
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(
    null
  )
  const [refundReason, setRefundReason] = useState("")
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(
    null
  )

  const fetchPayments = async (page = 1) => {
    setLoading(true)
    try {
      const params = {
        page,
        search: search || undefined,
        status: status === "all" ? undefined : status,
        type: type === "all" ? undefined : type,
      }
      const response = await financeApi.payments.list(params)
      setPayments(response.data)
      setPagination(response.meta)
    } catch (error) {
      console.error("Failed to fetch payments:", error)
      toast.error("Failed to load payments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search, status, type])

  const handleRefund = async () => {
    if (!selectedPayment || !refundReason) return

    try {
      await financeApi.payments.refund(selectedPayment.id, refundReason)
      toast.success("Refund processed successfully")
      setIsRefundDialogOpen(false)
      setRefundReason("")
      fetchPayments(pagination.current_page)
    } catch (error: any) {
      console.error("Refund failed:", error)
      toast.error(error.message || "Refund failed")
    }
  }

  const handleViewDetails = (id: number) => {
    setSelectedPaymentId(id)
    setIsDetailsOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      paid: "success",
      pending: "warning",
      refunded: "destructive",
      failed: "destructive",
      canceled: "secondary",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  return (
    <AdminDashboardShell title="Payments">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payer, email or reference..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="donation">Donations</SelectItem>
                    <SelectItem value="event">Events</SelectItem>
                    <SelectItem value="subscription">Subscriptions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-xs font-medium">
                          {payment.reference ||
                            payment.order_reference ||
                            "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">
                                {payment.payer?.name || "Guest"}
                              </span>
                              {payment.payer_id ? (
                                <Badge
                                  variant="secondary"
                                  className="h-4 bg-blue-100 px-1 text-[8px] font-bold uppercase text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                                >
                                  User
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="h-4 px-1 text-[8px] font-bold uppercase text-muted-foreground"
                                >
                                  Guest
                                </Badge>
                              )}
                              {payment.payer && (
                                <Link
                                  href={`/admin/users/${payment.payer.id}`}
                                  className="text-primary transition-colors hover:text-primary/80"
                                  title="View user profile"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {payment.payer?.email || payment.meta?.user_email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.currency} {payment.amount}
                        </TableCell>
                        <TableCell className="capitalize">
                          {payment.payable_type
                            .split("\\")
                            .pop()
                            ?.replace("Order", "") || "Payment"}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-sm">
                          {format(
                            new Date(payment.created_at),
                            "MMM d, yyyy HH:mm"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(payment.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payment.status === "paid" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedPayment(payment)
                                  setIsRefundDialogOpen(true)
                                }}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPayments(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
              >
                Previous
              </Button>
              <div className="text-sm font-medium">
                Page {pagination.current_page} of {pagination.last_page}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPayments(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Refund</DialogTitle>
              <DialogDescription>
                Are you sure you want to refund this payment of{" "}
                {selectedPayment?.currency} {selectedPayment?.amount}? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid items-center gap-4">
                <Label htmlFor="reason">Reason for refund</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsRefundDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRefund}
                disabled={!refundReason}
              >
                Confirm Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <PaymentDetailsDialog
          paymentId={selectedPaymentId}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      </div>
    </AdminDashboardShell>
  )
}
