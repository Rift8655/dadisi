"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, CreditCard, Shield, CheckCircle, XCircle, Clock } from "lucide-react"
import { donationsApi } from "@/lib/api"
import { useAuth } from "@/store/auth"
import { showSuccess, showWarning } from "@/lib/sweetalert"

interface DonationData {
  id: number
  reference: string
  donor_name: string
  donor_email: string
  donor_phone?: string
  amount: number
  currency: string
  status: string
  notes?: string
  county?: { id: number; name: string }
  campaign?: { id: number; title: string; slug: string }
  created_at: string
}

export default function DonationCheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const reference = (params?.reference as string) || ""

  const [processing, setProcessing] = useState(false)

  const { data: donation, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["donation-checkout", reference],
    queryFn: async () => {
      const response = await donationsApi.getByReference(reference)
      if (response.success && response.data) {
        return response.data as DonationData
      }
      throw new Error("Donation not found")
    },
    enabled: !!reference,
  })

  const error = queryError instanceof Error ? queryError.message : (queryError ? "Failed to load donation details" : null)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handlePayment = async () => {
    if (!donation) return

    setProcessing(true)
    try {
      // TODO: In production, this would call Pesapal to get the payment URL
      // For now, we simulate redirecting to a mock payment page
      const mockPaymentUrl = `/mock-payment/${donation.reference}`
      
      showSuccess("Redirecting to payment gateway...")
      
      // Simulate redirect
      setTimeout(() => {
        window.location.href = mockPaymentUrl
      }, 1500)
    } catch (err) {
      console.error("Payment error:", err)
      showWarning("Failed to initiate payment. Please try again.")
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-500/10 text-green-600 gap-1">
            <CheckCircle className="h-3 w-3" />
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-600 gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error || !donation) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl text-center">
        <h1 className="text-2xl font-bold mb-4">Donation Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || "The donation you're looking for doesn't exist."}</p>
        <Button asChild>
          <Link href="/donations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Donate
          </Link>
        </Button>
      </div>
    )
  }

  const isPending = donation.status === "pending"
  const isPaid = donation.status === "paid"

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/donations">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-2">
        {isPaid ? "Thank You!" : "Complete Your Donation"}
      </h1>
      <p className="text-muted-foreground mb-8">
        {isPaid
          ? "Your donation has been received successfully."
          : "Review your donation details and proceed to payment."}
      </p>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Donation Summary</CardTitle>
            {getStatusBadge(donation.status)}
          </div>
          <CardDescription>Reference: {donation.reference}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount */}
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Donation Amount</p>
            <p className="text-4xl font-bold">{formatCurrency(donation.amount, donation.currency)}</p>
          </div>

          {/* Campaign info */}
          {donation.campaign && (
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-muted-foreground">Campaign</span>
              <Link
                href={`/campaigns/${donation.campaign.slug}`}
                className="font-medium text-primary hover:underline"
              >
                {donation.campaign.title}
              </Link>
            </div>
          )}

          {/* Donor info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Donor Name</span>
              <span className="font-medium">{donation.donor_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{donation.donor_email}</span>
            </div>
            {donation.donor_phone && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{donation.donor_phone}</span>
              </div>
            )}
            {donation.county && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">County</span>
                <span className="font-medium">{donation.county.name}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {donation.notes && (
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground mb-1">Message</p>
              <p className="text-sm italic">&ldquo;{donation.notes}&rdquo;</p>
            </div>
          )}

          {/* Action buttons */}
          {isPending && (
            <div className="pt-4 space-y-3">
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full"
                size="lg"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {processing ? "Processing..." : "Proceed to Payment"}
              </Button>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure payment powered by Pesapal</span>
              </div>
            </div>
          )}

          {isPaid && (
            <div className="pt-4 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="font-medium">Payment Successful</p>
              <p className="text-sm text-muted-foreground mt-1">
                Thank you for your generous contribution!
              </p>
              {user && (
                <Button className="mt-4" variant="outline" asChild>
                  <Link href="/dashboard/donations">View My Donations</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
