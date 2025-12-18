"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { useAuth } from "@/store/auth"
import { plansApi } from "@/lib/api"

interface Plan {
  id: number
  name: string
  slug: string
  description?: string
  price_monthly: number
  price_yearly: number
  currency: string
  features: string[]
  is_popular?: boolean
}

interface Subscription {
  id: number
  plan: Plan
  billing_interval: "monthly" | "yearly"
  status: "active" | "cancelled" | "expired" | "past_due"
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

// Mock subscription - would come from API
const mockSubscription: Subscription | null = {
  id: 1,
  plan: {
    id: 2,
    name: "Premium",
    slug: "premium",
    description: "Full access to all features",
    price_monthly: 500,
    price_yearly: 5000,
    currency: "KES",
    features: [
      "Blog posting access",
      "Priority event registration",
      "Exclusive content",
      "Community chat access",
      "Early access to new features",
    ],
    is_popular: true,
  },
  billing_interval: "monthly",
  status: "active",
  current_period_start: "2024-12-01",
  current_period_end: "2025-01-01",
  cancel_at_period_end: false,
}

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(mockSubscription)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const plansData = await plansApi.getAll()
        const plansList = Array.isArray(plansData) ? plansData : []
        setPlans(
          plansList.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            price_monthly: p.price_monthly || p.price || 0,
            price_yearly: p.price_yearly || (p.price || 0) * 10,
            currency: p.currency || "KES",
            features: p.features || [],
            is_popular: p.is_popular,
          }))
        )
      } catch (error) {
        console.error("Failed to load plans:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
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
      case "active":
        return <Badge className="bg-green-500/10 text-green-600">Active</Badge>
      case "cancelled":
        return <Badge className="bg-yellow-500/10 text-yellow-600">Cancelled</Badge>
      case "expired":
        return <Badge variant="secondary">Expired</Badge>
      case "past_due":
        return <Badge className="bg-red-500/10 text-red-600">Past Due</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleCancelSubscription = async () => {
    // TODO: Call API to cancel subscription
    setSubscription((prev) =>
      prev ? { ...prev, cancel_at_period_end: true } : null
    )
    setShowCancelConfirm(false)
  }

  const handleReactivate = async () => {
    // TODO: Call API to reactivate subscription
    setSubscription((prev) =>
      prev ? { ...prev, cancel_at_period_end: false } : null
    )
  }

  return (
    <UserDashboardShell title="Subscription">
      <div className="space-y-6">
        {/* Current Subscription */}
        {subscription ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {subscription.plan.name} Plan
                    {getStatusBadge(subscription.status)}
                  </CardTitle>
                  <CardDescription>
                    {subscription.billing_interval === "monthly" ? "Monthly" : "Yearly"} billing
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      subscription.billing_interval === "monthly"
                        ? subscription.plan.price_monthly
                        : subscription.plan.price_yearly,
                      subscription.plan.currency
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    per {subscription.billing_interval === "monthly" ? "month" : "year"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Billing Info */}
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Period</p>
                    <p className="font-medium">
                      {formatDate(subscription.current_period_start)} -{" "}
                      {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Billing Date</p>
                    <p className="font-medium">
                      {subscription.cancel_at_period_end
                        ? "Subscription ends on " + formatDate(subscription.current_period_end)
                        : formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-medium mb-3">Included in your plan:</h4>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {subscription.plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <svg
                        className="h-4 w-4 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 border-t pt-4">
                <Button variant="outline">Change Plan</Button>
                <Button variant="outline">Update Payment Method</Button>
                {subscription.cancel_at_period_end ? (
                  <Button variant="outline" onClick={handleReactivate}>
                    Reactivate Subscription
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setShowCancelConfirm(true)}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>

              {/* Cancel Warning */}
              {subscription.cancel_at_period_end && (
                <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Your subscription has been cancelled and will end on{" "}
                    {formatDate(subscription.current_period_end)}. You can reactivate anytime before
                    this date.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* No Subscription */
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg
                  className="h-8 w-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <CardTitle>No Active Subscription</CardTitle>
              <CardDescription>
                Upgrade to a paid plan to unlock premium features like blog posting, priority event
                registration, and more.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Available Plans */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {subscription ? "Other Plans" : "Available Plans"}
          </h2>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-48 animate-pulse rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : plans.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => {
                const isCurrentPlan = subscription?.plan.id === plan.id
                return (
                  <Card
                    key={plan.id}
                    className={`relative ${plan.is_popular ? "border-primary" : ""} ${
                      isCurrentPlan ? "bg-muted/30" : ""
                    }`}
                  >
                    {plan.is_popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {plan.name}
                        {isCurrentPlan && <Badge variant="secondary">Current</Badge>}
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-3xl font-bold">
                          {formatCurrency(plan.price_monthly, plan.currency)}
                        </p>
                        <p className="text-sm text-muted-foreground">per month</p>
                      </div>
                      <ul className="space-y-2">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <svg
                              className="h-4 w-4 text-green-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        variant={isCurrentPlan ? "secondary" : "default"}
                        disabled={isCurrentPlan}
                      >
                        {isCurrentPlan ? "Current Plan" : "Select Plan"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No plans available at this time.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Card className="max-w-md mx-4">
              <CardHeader>
                <CardTitle>Cancel Subscription?</CardTitle>
                <CardDescription>
                  Are you sure you want to cancel your subscription? You&apos;ll lose access to
                  premium features at the end of your current billing period.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
                  Keep Subscription
                </Button>
                <Button variant="destructive" onClick={handleCancelSubscription}>
                  Confirm Cancellation
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </UserDashboardShell>
  )
}
