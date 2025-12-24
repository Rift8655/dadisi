"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Receipt, CreditCard, FileText, RefreshCw } from "lucide-react"
import { useAdminDonation, useInvalidateDonations } from "@/hooks/useAdminDonations"

export default function AdminDonationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const donationId = parseInt(params.id as string, 10)

  // TanStack Query hook with caching
  const { data: donation, isLoading, error, refetch, isFetching } = useAdminDonation(donationId)
  const { invalidateDetail } = useInvalidateDonations()

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
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500/10 text-green-600">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500/10 text-red-600">Failed</Badge>
      case "refunded":
        return <Badge className="bg-purple-500/10 text-purple-600">Refunded</Badge>
      default:
        return <Badge className="bg-muted text-muted-foreground">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <AdminDashboardShell title="Donation Details">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </AdminDashboardShell>
    )
  }

  if (error || !donation) {
    return (
      <AdminDashboardShell title="Donation Details">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Donation Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "The donation you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.push("/admin/donations")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Donations
          </Button>
        </div>
      </AdminDashboardShell>
    )
  }

  return (
    <AdminDashboardShell title="Donation Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/admin/donations")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Donations
          </Button>
          <div className="flex items-center gap-2">
            {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            {getStatusBadge(donation.status)}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Donation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Donation Summary
              </CardTitle>
              <CardDescription>Reference: {donation.reference}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="text-3xl font-bold">{formatCurrency(donation.amount, donation.currency)}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </span>
                  <span className="font-medium">{formatDate(donation.created_at)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Status
                  </span>
                  {getStatusBadge(donation.status)}
                </div>

                {donation.campaign && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Campaign
                    </span>
                    <Link
                      href={`/admin/campaigns?slug=${donation.campaign.slug}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {donation.campaign.title}
                    </Link>
                  </div>
                )}

                {!donation.campaign && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Type
                    </span>
                    <span className="font-medium">General Fund</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Donor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Donor Information
              </CardTitle>
              {donation.user && (
                <CardDescription>Registered User (ID: {donation.user.id})</CardDescription>
              )}
              {!donation.user && (
                <CardDescription>Guest Donor</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{donation.donor_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{donation.donor_email}</p>
                  </div>
                </div>

                {donation.donor_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{donation.donor_phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">County</p>
                    <p className="font-medium">{donation.county?.name || "—"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {donation.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Donor Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="italic text-muted-foreground">&ldquo;{donation.notes}&rdquo;</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminDashboardShell>
  )
}
