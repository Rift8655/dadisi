"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Eye, Filter, RotateCcw, Search, User, XCircle } from "lucide-react"
import { toast } from "sonner"
import Swal from "sweetalert2"

import { plansApi, subscriptionsApi } from "@/lib/api-admin"
import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { SubscriptionDetailsDialog } from "@/components/admin/subscription-details-dialog"

export default function AdminSubscriptionsPage() {
  const [params, setParams] = useState({
    page: 1,
    search: "",
    status: "all",
    plan_id: "all",
  })
  const [plans, setPlans] = useState<any[]>([])
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<
    number | null
  >(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const { data: response, isLoading } = useAdminSubscriptions({
    ...params,
    status: params.status === "all" ? undefined : params.status,
    plan_id: params.plan_id === "all" ? undefined : params.plan_id,
  })

  useEffect(() => {
    plansApi.list().then(setPlans).catch(console.error)
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }))
  }

  const handleStatusChange = (value: string) => {
    setParams((prev) => ({ ...prev, status: value, page: 1 }))
  }

  const handlePlanChange = (value: string) => {
    setParams((prev) => ({ ...prev, plan_id: value, page: 1 }))
  }

  const handleViewDetails = (id: number) => {
    setSelectedSubscriptionId(id)
    setIsDetailsOpen(true)
  }

  const handleCancelSub = async (id: number) => {
    const result = await Swal.fire({
      title: "Cancel Subscription?",
      text: "This will terminate the member's subscription immediately. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
    })

    if (result.isConfirmed) {
      try {
        await subscriptionsApi.cancel(id)
        toast.success("Subscription cancelled successfully")
        // Refresh data
        setParams((p) => ({ ...p }))
      } catch (err: any) {
        toast.error(err.message || "Failed to cancel subscription")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "success" | "warning" | "destructive" | "secondary" | "outline"
    > = {
      active: "success",
      expired: "destructive",
      canceled: "secondary",
      pending: "warning",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  const subscriptions = response?.data || []
  const meta = response?.meta || { current_page: 1, last_page: 1, total: 0 }

  return (
    <AdminDashboardShell title="Subscribers">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Active Subscribers
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage all member subscriptions across the platform.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, email or plan..."
                  className="pl-8"
                  value={params.search}
                  onChange={handleSearch}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={params.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={params.plan_id} onValueChange={handlePlanChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                        {plan.name}
                      </SelectItem>
                    ))}
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
                    <TableHead>Subscriber</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Auto-Renew</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Loading subscriptions...
                      </TableCell>
                    </TableRow>
                  ) : subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No subscriptions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((sub: any) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              <User className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col text-sm">
                              <span className="font-medium">
                                {sub.user_name}
                              </span>
                              <span className="text-muted-foreground">
                                {sub.user_email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="font-medium">
                              {sub.plan_display_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(sub.status)}</TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col">
                            <span>
                              Since:{" "}
                              {sub.starts_at
                                ? format(new Date(sub.starts_at), "MMM d, yyyy")
                                : "N/A"}
                            </span>
                            <span className="italic text-muted-foreground">
                              Expires:{" "}
                              {sub.expires_at
                                ? format(
                                    new Date(sub.expires_at),
                                    "MMM d, yyyy"
                                  )
                                : "Never"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={sub.auto_renew ? "success" : "secondary"}
                          >
                            {sub.auto_renew ? "On" : "Off"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Details"
                              onClick={() => handleViewDetails(sub.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {sub.status === "active" && sub.plan_price > 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                title="Cancel Subscription"
                                onClick={() => handleCancelSub(sub.id)}
                              >
                                <XCircle className="h-4 w-4" />
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
              <div className="flex-1 text-sm text-muted-foreground">
                Total: {meta.total} subscriptions
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}
                disabled={meta.current_page === 1}
              >
                Previous
              </Button>
              <div className="text-sm font-medium">
                Page {meta.current_page} of {meta.last_page}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
                disabled={meta.current_page === meta.last_page}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <SubscriptionDetailsDialog
          subscriptionId={selectedSubscriptionId}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      </div>
    </AdminDashboardShell>
  )
}
