"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
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
import { Search, Download, Eye, DollarSign, Users, TrendingUp, RefreshCw } from "lucide-react"
import { useAdminDonations, useAdminDonationStats, useInvalidateDonations } from "@/hooks/useAdminDonations"

export default function AdminDonationsPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  
  // Build params for the query
  const params = {
    page,
    per_page: perPage,
    ...(search && { search }),
    ...(status !== "all" && { status }),
  }

  // TanStack Query hooks with caching
  const { data, isLoading, isFetching } = useAdminDonations(params)
  const { data: stats, isLoading: statsLoading } = useAdminDonationStats()
  const { invalidateAll } = useInvalidateDonations()
  
  const donations = data?.donations ?? []
  const pagination = data?.pagination ?? { total: 0, per_page: 25, current_page: 1, last_page: 1 }

  const handlePerPageChange = (value: string) => {
    setPerPage(parseInt(value, 10))
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "paid":
        return <Badge className="bg-green-500/10 text-green-600">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500/10 text-red-600">Failed</Badge>
      case "refunded":
        return <Badge className="bg-purple-500/10 text-purple-600">Refunded</Badge>
      default:
        return <Badge className="bg-muted text-muted-foreground">{s}</Badge>
    }
  }

  return (
    <AdminDashboardShell title="Donations">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Manage and track all donations
            {isFetching && !isLoading && (
              <RefreshCw className="inline ml-2 h-3 w-3 animate-spin" />
            )}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => invalidateAll()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" asChild>
              <a href="/api/admin/billing/export/donations" target="_blank">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </a>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.total_amount, "KES")}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.paid_count} successful donations
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_donations}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pending_count} pending
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Campaign Donations</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.campaign_donations, "KES")}</div>
                <p className="text-xs text-muted-foreground">From active campaigns</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">General Fund</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.general_donations, "KES")}</div>
                <p className="text-xs text-muted-foreground">Direct donations</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>All Donations</CardTitle>
            <CardDescription>View and filter donation records</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by donor name or email..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Rows" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="25">25 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                  <SelectItem value="100">100 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : donations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No donations found</p>
              </div>
            ) : (
              <div className="border rounded-md max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell className="font-mono text-sm">{donation.reference}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{donation.donor_name}</p>
                            <p className="text-sm text-muted-foreground">{donation.donor_email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(donation.amount, donation.currency)}
                        </TableCell>
                        <TableCell>
                          {donation.campaign ? (
                            <Link
                              href={`/admin/campaigns?slug=${donation.campaign.slug}`}
                              className="text-primary hover:underline"
                            >
                              {donation.campaign.title}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">General Fund</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(donation.status)}</TableCell>
                        <TableCell>{formatDate(donation.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/donations/${donation.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {donations.length > 0 ? (pagination.current_page - 1) * pagination.per_page + 1 : 0} to{" "}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{" "}
                {pagination.total} donations
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === pagination.last_page || pagination.last_page === 0}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardShell>
  )
}
