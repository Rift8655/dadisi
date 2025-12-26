"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { XCircle, RefreshCw, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function EventCheckoutErrorContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")
  const reason = searchParams.get("reason") || "payment_failed"

  const errorMessages: Record<string, { title: string; description: string }> = {
    payment_failed: {
      title: "Payment Failed",
      description: "Your payment could not be processed. Please try again or use a different payment method.",
    },
    payment_cancelled: {
      title: "Payment Cancelled",
      description: "You cancelled the payment process. No charges have been made to your account.",
    },
    expired: {
      title: "Session Expired",
      description: "Your checkout session has expired. Please start your purchase again.",
    },
    capacity_full: {
      title: "Event Full",
      description: "Sorry, this event has reached capacity while you were checking out. Please check for other events.",
    },
    unknown: {
      title: "Something Went Wrong",
      description: "An unexpected error occurred. Please try again or contact support.",
    },
  }

  const error = errorMessages[reason] || errorMessages.unknown

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl text-red-600 dark:text-red-400">
            {error.title}
          </CardTitle>
          <CardDescription className="text-base">
            {error.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {reference && (
            <div className="text-center text-sm text-muted-foreground">
              Order Reference: <span className="font-mono">{reference}</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {(reason === "payment_failed" || reason === "payment_cancelled") && (
              <Button 
                onClick={() => window.history.back()} 
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/events">
                Browse Events
              </Link>
            </Button>
            
            <Button asChild variant="ghost" className="w-full">
              <Link href="/support">
                <HelpCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            If you believe this is an error or need assistance, please contact our support team 
            with your order reference number.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function EventCheckoutErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <EventCheckoutErrorContent />
    </Suspense>
  )
}
