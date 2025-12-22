"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowLeft, CreditCard, Shield } from "lucide-react"
import { useAuth } from "@/store/auth"
import { useCurrency, Currency } from "@/store/currency"
import { CurrencySwitcher } from "@/components/currency-switcher"
import { api } from "@/lib/api"
import { showWarning, showSuccess } from "@/lib/sweetalert"

interface PlanData {
  id: number
  name: string | { en?: string }
  description?: string | { en?: string }
  pricing: {
    kes: { base_monthly: number; base_yearly: number; discounted_monthly?: number; discounted_yearly?: number }
    usd: { base_monthly: number; base_yearly: number; discounted_monthly?: number; discounted_yearly?: number }
  }
  promotions: {
    monthly: { active?: boolean; discount_percent?: number } | null
    yearly: { active?: boolean; discount_percent?: number } | null
  }
  features: { id: number; name: string | { en?: string }; limit: number | null }[]
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const user = useAuth((s) => s.user)
  const planId = searchParams.get("plan_id")
  const billingInterval = (searchParams.get("billing_interval") as "monthly" | "yearly") || "monthly"
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

  const [processing, setProcessing] = useState(false)

  const { data: plan, isLoading: loading, error } = useQuery({
    queryKey: ["checkout-plan", planId],
    queryFn: async () => {
      if (!planId) throw new Error("No plan selected")
      const response = await api.get<{ success: boolean; data: PlanData }>(`/api/plans/${planId}`)
      if (response.success && response.data) {
        return response.data
      }
      throw new Error("Plan not found")
    },
    enabled: !!planId,
  })

  const extractValue = (value: string | { en?: string } | undefined): string => {
    if (!value) return ""
    if (typeof value === "string") return value
    return value.en || Object.values(value)[0] || ""
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
      const response = await api.post<{
        success: boolean
        message: string
        next_url?: string
      }>("/api/subscriptions", {
        plan_id: plan.id,
        billing_interval: billingInterval,
        currency: activeCurrency,
      })

      if (response.next_url) {
        // Redirect to payment gateway
        window.location.href = response.next_url
      } else if (response.message?.includes("free plan")) {
        showSuccess("Successfully subscribed to the free plan!")
        router.push("/dashboard")
      } else {
        showSuccess("Subscription created successfully!")
        router.push("/dashboard")
      }
    } catch (err: unknown) {
      console.error("Checkout error:", err)
      const errorMessage = (err as { message?: string })?.message || "Checkout failed. Please try again."
      showWarning(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-96" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl text-center">
        <h1 className="text-2xl font-bold mb-4">Oops!</h1>
        <p className="text-muted-foreground mb-6">{error instanceof Error ? error.message : (error || "Plan not found")}</p>
        <Button onClick={() => router.push("/membership")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Plans
        </Button>
      </div>
    )
  }

  const planName = extractValue(plan.name)
  const planDescription = extractValue(plan.description)
  
  // Use pricing based on selected currency
  const pricing = activeCurrency === "KES" ? plan.pricing.kes : plan.pricing.usd
  const promo = billingInterval === "monthly" ? plan.promotions.monthly : plan.promotions.yearly
  const isPromoActive = promo?.active ?? false

  const basePrice = billingInterval === "monthly" ? pricing.base_monthly : pricing.base_yearly
  const discountedPrice = billingInterval === "monthly" ? pricing.discounted_monthly : pricing.discounted_yearly
  const finalPrice = isPromoActive && discountedPrice ? discountedPrice : basePrice

  const formatPrice = (val: number) => {
    return activeCurrency === "KES"
      ? `KES ${val.toLocaleString()}`
      : `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => router.push("/membership")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Plans
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Currency:</span>
          <CurrencySwitcher />
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-2">Complete Your Subscription</h1>
      <p className="text-muted-foreground mb-8">Review your selected plan and proceed to payment</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Plan Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{planName}</CardTitle>
              <Badge variant="default" className="capitalize">{billingInterval}</Badge>
            </div>
            {planDescription && (
              <CardDescription>{planDescription}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pricing */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold">
                {finalPrice === 0 ? "Free" : formatPrice(finalPrice)}
                {finalPrice !== 0 && (
                  <span className="text-base font-normal text-muted-foreground">
                    /{billingInterval === "monthly" ? "month" : "year"}
                  </span>
                )}
              </div>
              {isPromoActive && discountedPrice && discountedPrice < basePrice && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground line-through">{formatPrice(basePrice)}</span>
                  <Badge className="bg-green-500">{promo?.discount_percent}% off</Badge>
                </div>
              )}
            </div>

            {/* Features */}
            <div>
              <h4 className="font-medium mb-3">What&apos;s included:</h4>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature.id} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
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
              <div className="border-t pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(finalPrice)}</span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full mt-4"
                size="lg"
              >
                {processing ? "Processing..." : finalPrice === 0 ? "Subscribe for Free" : "Proceed to Payment"}
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <Shield className="h-4 w-4" />
            <span>Secure payment powered by Pesapal</span>
          </div>
        </div>
      </div>
    </div>
  )
}
