"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/store/auth"
import { Currency, useCurrency } from "@/store/currency"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Check, CreditCard, Shield } from "lucide-react"

import { api } from "@/lib/api"
import { showSuccess, showWarning } from "@/lib/sweetalert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CurrencySwitcher } from "@/components/currency-switcher"

interface PlanData {
  id: number
  name: string | { en?: string }
  description?: string | { en?: string }
  pricing: {
    kes: {
      base_monthly: number
      base_yearly: number
      discounted_monthly?: number
      discounted_yearly?: number
    }
    usd: {
      base_monthly: number
      base_yearly: number
      discounted_monthly?: number
      discounted_yearly?: number
    }
  }
  promotions: {
    monthly: { active?: boolean; discount_percent?: number } | null
    yearly: { active?: boolean; discount_percent?: number } | null
  }
  features: {
    id: number
    name: string | { en?: string }
    limit: number | null
  }[]
}

function SubscriptionCheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const user = useAuth((s) => s.user)
  const planId = searchParams.get("plan_id")
  const billingInterval =
    (searchParams.get("billing_interval") as "monthly" | "yearly") || "monthly"
  const urlCurrency = searchParams.get("currency") as Currency | null

  // Use currency from URL if provided, otherwise use store
  const { currency: storeCurrency, setCurrency } = useCurrency()
  const activeCurrency = urlCurrency || storeCurrency

  // Sync URL currency to store on mount
  useEffect(() => {
    if (urlCurrency && urlCurrency !== storeCurrency) {
      setCurrency(urlCurrency)
    }
  }, [urlCurrency, storeCurrency, setCurrency])

  // Check if user already has active subscription for this plan
  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (!user || !planId) return

      try {
        const response = await api.get<{
          success: boolean
          data?: {
            plan_id?: number
            status?: string
          }
        }>("/api/subscriptions/current")

        const currentSub = response.data
        if (
          currentSub &&
          currentSub.plan_id === parseInt(planId) &&
          currentSub.status === "active"
        ) {
          showWarning("You already have an active subscription to this plan.")
          router.push("/dashboard/subscription")
        }
      } catch {
        // No current subscription or error - continue with checkout
      }
    }

    checkExistingSubscription()
  }, [user, planId, router])

  const [processing, setProcessing] = useState(false)

  const {
    data: plan,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["checkout-plan", planId],
    queryFn: async () => {
      if (!planId) throw new Error("No plan selected")
      const response = await api.get<{ success: boolean; data: PlanData }>(
        `/api/plans/${planId}`
      )
      if (response.success && response.data) {
        return response.data
      }
      throw new Error("Plan not found")
    },
    enabled: !!planId,
  })

  const extractValue = (
    value: string | { en?: string } | undefined
  ): string => {
    if (!value) return ""
    if (typeof value === "string") {
      // Try parsing JSON strings
      try {
        const parsed = JSON.parse(value)
        if (typeof parsed === "object" && parsed !== null) {
          return parsed.en || Object.values(parsed)[0] || value
        }
        return String(parsed)
      } catch {
        return value
      }
    }
    return value.en || Object.values(value)[0] || ""
  }

  // Helper to check if a feature is a quota (machine-readable) vs display feature
  const isQuotaFeature = (featureName: string): boolean => {
    const quotaPatterns = [
      "Monthly Event",
      "Event Discount",
      "Monthly Blog",
      "Lab Hours",
      "Forum Posts",
    ]
    return quotaPatterns.some((pattern) => featureName.includes(pattern))
  }

  const handleCheckout = async () => {
    if (!user) {
      showWarning("Please sign in to continue")
      router.push("/login")
      return
    }

    if (!plan) return

    setProcessing(true)

    try {
      // For free plans, we still need to "purchase" them to create proper subscription records
      const response = await api.post<{
        success: boolean
        message?: string
        error_code?: string
        action?: string
        data?: {
          transaction_id?: string
          redirect_url?: string
          order_tracking_id?: string
          requires_approval?: boolean
          subscription_id?: number
        }
      }>("/api/subscriptions/initiate-payment", {
        plan_id: plan.id,
        billing_period: billingInterval === "monthly" ? "month" : "year",
        enable_auto_renewal: searchParams.get("auto_renewal") === "true",
      })

      if (response.data?.redirect_url) {
        // Redirect to payment gateway
        window.location.href = response.data.redirect_url
      } else if (response.data?.requires_approval) {
        showSuccess(
          "This plan requires student status verification. Your pending subscription has been created."
        )
        router.push(
          `/membership/approval?plan_id=${plan.id}&subscription_id=${response.data.subscription_id}`
        )
      } else if (response.message?.toLowerCase().includes("free")) {
        showSuccess("Successfully subscribed to the free plan!")
        router.push("/dashboard/subscription")
      } else {
        showSuccess(response.message || "Subscription created successfully!")
        router.push("/dashboard/subscription")
      }
    } catch (err: unknown) {
      console.error("Checkout error:", err)

      // Handle specific error codes from API
      const error = err as {
        message?: string
        data?: { error_code?: string; action?: string }
      }
      const errorCode = error.data?.error_code
      const action = error.data?.action

      if (errorCode === "ALREADY_SUBSCRIBED") {
        showWarning("You already have an active subscription to this plan.")
        router.push("/dashboard/subscription")
        return
      }

      if (errorCode === "PAYMENT_PENDING") {
        showWarning(
          "You have a pending payment. Please complete or cancel it first."
        )
        router.push("/dashboard/subscription")
        return
      }

      const errorMessage = error.message || "Checkout failed. Please try again."
      showWarning(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="mb-4 text-2xl font-bold">Oops!</h1>
        <p className="mb-6 text-muted-foreground">
          {error instanceof Error ? error.message : error || "Plan not found"}
        </p>
        <Button onClick={() => router.push("/dashboard/subscription")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subscription
        </Button>
      </div>
    )
  }

  const planName = extractValue(plan.name)
  const planDescription = extractValue(plan.description)

  // Use pricing based on selected currency
  const pricing = activeCurrency === "KES" ? plan.pricing.kes : plan.pricing.usd
  const promo =
    billingInterval === "monthly"
      ? plan.promotions.monthly
      : plan.promotions.yearly
  const isPromoActive = promo?.active ?? false

  const basePrice =
    billingInterval === "monthly" ? pricing.base_monthly : pricing.base_yearly
  const discountedPrice =
    billingInterval === "monthly"
      ? pricing.discounted_monthly
      : pricing.discounted_yearly
  const finalPrice =
    isPromoActive && discountedPrice ? discountedPrice : basePrice

  const formatPrice = (val: number) => {
    return activeCurrency === "KES"
      ? `KES ${val.toLocaleString()}`
      : `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/subscription")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subscription
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Currency:
          </span>
          <CurrencySwitcher />
        </div>
      </div>

      <h1 className="mb-2 text-3xl font-bold">Complete Your Subscription</h1>
      <p className="mb-8 text-muted-foreground">
        Review your selected plan and proceed to payment
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Plan Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{planName}</CardTitle>
              <Badge variant="default" className="capitalize">
                {billingInterval}
              </Badge>
            </div>
            {planDescription && (
              <CardDescription>{planDescription}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pricing */}
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="text-3xl font-bold">
                {finalPrice === 0 ? "Free" : formatPrice(finalPrice)}
                {finalPrice !== 0 && (
                  <span className="text-base font-normal text-muted-foreground">
                    /{billingInterval === "monthly" ? "month" : "year"}
                  </span>
                )}
              </div>
              {isPromoActive &&
                discountedPrice &&
                discountedPrice < basePrice && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(basePrice)}
                    </span>
                    <Badge className="bg-green-500">
                      {promo?.discount_percent}% off
                    </Badge>
                  </div>
                )}
            </div>

            {/* Features */}
            <div>
              <h4 className="mb-3 font-medium">What&apos;s included:</h4>
              <ul className="space-y-2">
                {plan.features
                  .filter((f) => !isQuotaFeature(extractValue(f.name)))
                  .map((feature) => (
                    <li
                      key={feature.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>{extractValue(feature.name)}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(basePrice)}</span>
              </div>
              {isPromoActive && discountedPrice && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Promotion Discount</span>
                  <span>-{formatPrice(basePrice - discountedPrice)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-4 font-bold">
                <span>Total</span>
                <span>{formatPrice(finalPrice)}</span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={processing}
                className="mt-4 w-full"
                size="lg"
              >
                {processing
                  ? "Processing..."
                  : finalPrice === 0
                    ? "Subscribe for Free"
                    : "Proceed to Payment"}
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secure payment powered by Pesapal</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Skeleton className="mb-8 h-8 w-48" />
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-64" />
          </div>
        </div>
      }
    >
      <SubscriptionCheckoutContent />
    </Suspense>
  )
}
