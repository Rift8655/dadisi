"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { useAuth } from "@/store/auth"
import { donationsApi, api } from "@/lib/api"
import { RefreshCw, ExternalLink, X } from "lucide-react"
import Swal from "sweetalert2"
import { useQueryClient } from "@tanstack/react-query"

interface Donation {
  id: number
  amount: number
  currency: string
  status: string
  payment_method: string
  created_at: string
  reference: string
  receipt_number?: string
  receipt_url?: string
  campaign?: string
}

export default function DonationsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: donations = [], isLoading: loading } = useQuery({
    queryKey: ["user-donations"],
    queryFn: async () => {
      const response = await donationsApi.list({ page: 1 })
      const donationsList = response?.data || []
      
      return donationsList.map((d) => ({
        id: d.id,
        amount: d.amount,
        currency: d.currency || "KES",
        status: d.status === "paid" ? "completed" : d.status,
        // Map payment_method: mpesa -> M-Pesa, card -> Card, null -> pending/unknown
        payment_method: d.payment_method 
          ? (d.payment_method === "mpesa" ? "M-Pesa" : d.payment_method === "card" ? "Card" : d.payment_method)
          : "Pending",
        created_at: d.created_at,
        reference: d.reference,
        receipt_number: d.receipt_number,
        receipt_url: d.receipt_url,
        campaign: d.campaign?.title,
      })) as Donation[]
    },
  })

  const totalDonated = donations.reduce((sum, d) => 
    d.status === "completed" ? sum + d.amount : sum, 0
  )


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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500/10 text-red-600">Failed</Badge>
      default:
        return <Badge className="bg-muted text-muted-foreground">{status}</Badge>
    }
  }

  const handleCancelDonation = async (donation: Donation) => {
    const result = await Swal.fire({
      title: "Cancel Donation?",
      text: `Are you sure you want to cancel this ${formatCurrency(donation.amount, donation.currency)} donation?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "Keep it",
    })

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/donations/${donation.id}`)
        queryClient.invalidateQueries({ queryKey: ["user-donations"] })
        Swal.fire("Cancelled", "Your donation has been cancelled.", "success")
      } catch (err) {
        Swal.fire("Error", "Failed to cancel donation. Please try again.", "error")
      }
    }
  }

  return (
    <UserDashboardShell title="My Donations">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Donated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(totalDonated, "KES")}</p>
              <p className="text-xs text-muted-foreground mt-1">Thank you for your generosity!</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Donations Made
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{donations.filter(d => d.status === "completed").length}</p>
              <p className="text-xs text-muted-foreground mt-1">Successful contributions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Community</p>
              <p className="text-xs text-muted-foreground mt-1">Your support makes a difference</p>
            </CardContent>
          </Card>
        </div>

        {/* Make Another Donation */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Want to make another contribution?</h3>
              <p className="text-sm text-muted-foreground">
                Your donations help support community programs and events.
              </p>
            </div>
            <Button asChild>
              <Link href="/donations">Donate Now</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Donations List */}
        <Card>
          <CardHeader>
            <CardTitle>Donation History</CardTitle>
            <CardDescription>A record of all your contributions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : donations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Campaign</th>
                      <th className="pb-3 font-medium">Payment</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Receipt</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {donations.map((donation) => (
                      <tr key={donation.id} className="text-sm">
                        <td className="py-3">{formatDate(donation.created_at)}</td>
                        <td className="py-3 font-medium">
                          {formatCurrency(donation.amount, donation.currency)}
                        </td>
                        <td className="py-3">{donation.campaign || "General Fund"}</td>
                        <td className="py-3">{donation.payment_method}</td>
                        <td className="py-3">{getStatusBadge(donation.status)}</td>
                        <td className="py-3">
                          {donation.receipt_url ? (
                            <div className="flex flex-col">
                              <span className="text-xs font-mono">{donation.receipt_number}</span>
                              <Button variant="link" size="sm" className="h-auto p-0 justify-start h-6" asChild>
                                <a href={donation.receipt_url} target="_blank" rel="noopener noreferrer">
                                  Download
                                </a>
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3">
                          {donation.status === "pending" && (
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <a href={`/donations/checkout/${donation.reference}`}>
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Resume
                                </a>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleCancelDonation(donation)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          )}
                          {donation.status === "completed" && (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-muted-foreground/50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <h3 className="mt-4 font-medium">No donations yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Make your first contribution to support the community.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/donations">Make a Donation</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserDashboardShell>
  )
}
