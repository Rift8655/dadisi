"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/store/auth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Clock, ExternalLink, XCircle } from "lucide-react"

import { plansApi, subscriptionsApi } from "@/lib/api"
import { showError, showSuccess } from "@/lib/sweetalert"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserDashboardShell } from "@/components/user-dashboard-shell"

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
  requires_student_approval?: boolean
}

interface CurrentSubscription {
  id: number
  plan: Plan
  billing_interval: "monthly" | "yearly"
  status:
    | "active"
    | "cancelled"
    | "expired"
    | "past_due"
    | "payment_pending"
    | "pending"
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  pesapal_recurring_enabled?: boolean
  payment_method?: string
}

export default function SubscriptionPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [upgradingPlanId, setUpgradingPlanId] = useState<number | null>(null)

  // Helper function - defined early to avoid hoisting issues
  const getLocalizedValue = (value: any): string => {
    if (typeof value === "string") {
      // Try parsing JSON strings like '{"en":"Community"}'
      try {
        const parsed = JSON.parse(value)
        if (typeof parsed === "object" && parsed !== null) {
          return parsed.en || (Object.values(parsed)[0] as string) || value
        }
        return String(parsed)
      } catch {
        return value
      }
    }
    if (typeof value === "object" && value !== null) {
      return value.en || (Object.values(value)[0] as string) || ""
    }
    return ""
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

  // Fetch current subscription from API
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["current-subscription"],
    queryFn: async () => {
      const res = await subscriptionsApi.current()
      return res.data
    },
    enabled: isAuthenticated,
  })

  // Transform API response to component format
  const subscription: CurrentSubscription | null =
    subscriptionData?.subscription && subscriptionData?.plan
      ? {
          id: subscriptionData.subscription.id,
          plan: {
            id: subscriptionData.plan.id,
            name: getLocalizedValue(subscriptionData.plan.name),
            slug: "", // Not provided by API
            description: getLocalizedValue(subscriptionData.plan.description),
            price_monthly: subscriptionData.plan.price || 0,
            price_yearly: (subscriptionData.plan.price || 0) * 10,
            currency: "KES",
            features: [], // Will be populated from plans query
            is_popular: false,
          },
          billing_interval: "monthly", // Default, enhance later with enhancement metadata
          status: (subscriptionData.enhancement?.status as any) || "active",
          current_period_start: subscriptionData.subscription.starts_at,
          current_period_end: subscriptionData.subscription.ends_at,
          cancel_at_period_end: !!subscriptionData.subscription.cancels_at,
          pesapal_recurring_enabled:
            !!subscriptionData.enhancement?.pesapal_recurring_enabled,
          payment_method: subscriptionData.enhancement?.payment_method,
        }
      : null

  // Fetch plans list
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const plansData = await plansApi.getAll()
      const plansList = Array.isArray(plansData) ? plansData : []
      return plansList.map((p: any) => ({
        id: p.id,
        name: getLocalizedValue(p.name),
        slug: p.slug,
        description: getLocalizedValue(p.description),
        // Correctly read price from pricing.kes.base_monthly
        price_monthly:
          p.pricing?.kes?.base_monthly ?? p.price_monthly ?? p.price ?? 0,
        price_yearly:
          p.pricing?.kes?.base_yearly ??
          (p.pricing?.kes?.base_monthly ? p.pricing.kes.base_monthly * 10 : 0),
        currency: "KES",
        features: (p.features || []).map((f: any) =>
          getLocalizedValue(typeof f === "object" ? f.name : f)
        ),
        system_features: p.system_features || [],
        is_popular: p.is_popular,
        requires_student_approval: p.requires_student_approval || false,
      })) as Plan[]
    },
  })

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: (reason?: string) => subscriptionsApi.cancel(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] })
      setShowCancelConfirm(false)
    },
  })

  // Upgrade/Select plan - for free plans, call API directly; for paid plans, navigate to checkout
  const upgradeMutation = useMutation({
    mutationFn: (planId: number) =>
      subscriptionsApi.initiatePayment({
        plan_id: planId,
        billing_period: "month",
      }),
    onSuccess: async () => {
      await showSuccess("Success", "Plan selected successfully!")
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] })
      setUpgradingPlanId(null)
    },
    onError: async (error: any) => {
      await showError("Error", error.message || "Failed to select plan")
      setUpgradingPlanId(null)
    },
  })

  // Cancel pending payment mutation
  const cancelPaymentMutation = useMutation({
    mutationFn: () => subscriptionsApi.cancelPayment(),
    onSuccess: async () => {
      await showSuccess("Cancelled", "Payment session cancelled successfully.")
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] })
    },
    onError: async (error: any) => {
      await showError("Error", error.message || "Failed to cancel payment")
    },
  })

  const handleSelectPlan = (plan: Plan) => {
    const {
      id: planId,
      price_monthly: priceMonthly,
      requires_student_approval,
    } = plan

    // Plans requiring student approval - redirect to approval page first
    if (requires_student_approval) {
      router.push(`/membership/approval?plan_id=${planId}`)
      return
    }

    if (priceMonthly === 0) {
      // Free plan - select directly
      setUpgradingPlanId(planId)
      upgradeMutation.mutate(planId)
    } else {
      // Paid plan - navigate to checkout page
      router.push(
        `/checkout/subscription?plan_id=${planId}&billing_interval=monthly`
      )
    }
  }

  const scrollToPlans = () => {
    document
      .getElementById("available-plans")
      ?.scrollIntoView({ behavior: "smooth" })
  }

  const loading = subscriptionLoading || plansLoading

  // Merge plan features from plans list into subscription
  const subscriptionWithFeatures = subscription
    ? {
        ...subscription,
        plan: {
          ...subscription.plan,
          features:
            plans.find((p) => p.id === subscription.plan.id)?.features ||
            subscription.plan.features,
        },
      }
    : null

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
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600">Cancelled</Badge>
        )
      case "pending_cancellation":
        return (
          <Badge className="bg-orange-500/10 text-orange-600">
            Cancels at Period End
          </Badge>
        )
      case "expired":
        return <Badge variant="secondary">Expired</Badge>
      case "past_due":
        return <Badge className="bg-red-500/10 text-red-600">Past Due</Badge>
      case "payment_pending":
      case "pending":
        return (
          <Badge className="bg-blue-500/10 text-blue-600">
            Payment Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleCancelSubscription = async () => {
    cancelMutation.mutate("")
  }

  const handleReactivate = async () => {
    // Note: Backend may not support reactivation; implement if supported
    // For now, just refresh the query
    queryClient.invalidateQueries({ queryKey: ["current-subscription"] })
  }

  return (
    <UserDashboardShell title="Subscription">
      <div className="space-y-6">
        {/* Pending Payment Alert */}
        {subscriptionWithFeatures &&
          (["payment_pending", "pending"] as const).includes(
            subscriptionWithFeatures.status as "payment_pending" | "pending"
          ) && (
            <Alert className="border-blue-200 bg-blue-50 text-blue-900">
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertTitle className="font-semibold">Payment Pending</AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <p>
                  You have a pending payment for the{" "}
                  <strong>
                    {getLocalizedValue(subscriptionWithFeatures.plan.name)}
                  </strong>{" "}
                  plan. Please complete your payment to activate your
                  subscription.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() =>
                      router.push(
                        `/checkout/subscription?plan_id=${subscriptionWithFeatures.plan.id}&billing_interval=${subscriptionWithFeatures.billing_interval}`
                      )
                    }
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Resume Payment
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={() => cancelPaymentMutation.mutate()}
                    disabled={cancelPaymentMutation.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {cancelPaymentMutation.isPending
                      ? "Cancelling..."
                      : "Cancel Payment Session"}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

        {/* Renewal Expiry Warning - shows 14 days before expiry */}
        {subscriptionWithFeatures &&
          subscriptionWithFeatures.status === "active" &&
          subscriptionWithFeatures.plan.price_monthly > 0 &&
          subscriptionWithFeatures.current_period_end &&
          new Date(subscriptionWithFeatures.current_period_end) <=
            new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) && (
            <Alert className="border-amber-200 bg-amber-50 text-amber-900">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertTitle className="font-semibold">
                Subscription Expiring Soon
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <p>
                  Your{" "}
                  <strong>
                    {getLocalizedValue(subscriptionWithFeatures.plan.name)}
                  </strong>{" "}
                  subscription expires on{" "}
                  <strong>
                    {formatDate(subscriptionWithFeatures.current_period_end)}
                  </strong>
                  . Renew now to maintain your benefits.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    className="bg-amber-600 text-white hover:bg-amber-700"
                    onClick={() => router.push(`/membership`)}
                  >
                    Renew Now
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

        {/* Grace Period Alert */}
        {subscriptionWithFeatures &&
          subscriptionData?.enhancement?.status === "grace_period" && (
            <Alert className="border-red-200 bg-red-50 text-red-900">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="font-semibold">
                Grace Period Active
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <p>
                  Your subscription has expired. You have until{" "}
                  <strong>
                    {subscriptionData?.enhancement?.grace_period_ends_at
                      ? formatDate(
                          subscriptionData.enhancement.grace_period_ends_at
                        )
                      : "soon"}
                  </strong>{" "}
                  to renew and keep your benefits. After that, you&apos;ll be
                  moved to the free tier.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => router.push(`/membership`)}
                  >
                    Renew Now to Keep Benefits
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

        {/* Current Subscription */}
        {subscriptionWithFeatures ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getLocalizedValue(subscriptionWithFeatures.plan.name)} Plan
                  </CardTitle>
                  <CardDescription>
                    {subscriptionWithFeatures.plan.price_monthly === 0
                      ? "Free forever"
                      : `${subscriptionWithFeatures.billing_interval === "monthly" ? "Monthly" : "Yearly"} billing`}
                  </CardDescription>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {getStatusBadge(subscriptionWithFeatures.status)}
                    {subscriptionWithFeatures.pesapal_recurring_enabled ? (
                      <Badge className="bg-green-500/10 text-green-600">
                        Auto-Renewal Active (Card)
                      </Badge>
                    ) : subscriptionWithFeatures.payment_method === "MPESA" ? (
                      <Badge className="bg-amber-500/10 text-amber-600">
                        Manual Renewal (M-Pesa)
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {subscriptionWithFeatures.plan.price_monthly === 0
                      ? "Free"
                      : formatCurrency(
                          subscriptionWithFeatures.billing_interval ===
                            "monthly"
                            ? subscriptionWithFeatures.plan.price_monthly
                            : subscriptionWithFeatures.plan.price_yearly,
                          subscriptionWithFeatures.plan.currency
                        )}
                  </p>
                  {subscriptionWithFeatures.plan.price_monthly > 0 && (
                    <p className="text-sm text-muted-foreground">
                      per{" "}
                      {subscriptionWithFeatures.billing_interval === "monthly"
                        ? "month"
                        : "year"}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Billing Info - Only show for paid plans */}
              {subscriptionWithFeatures.plan.price_monthly > 0 &&
                subscriptionWithFeatures.current_period_end && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Current Period
                        </p>
                        <p className="font-medium">
                          {formatDate(
                            subscriptionWithFeatures.current_period_start
                          )}{" "}
                          -{" "}
                          {formatDate(
                            subscriptionWithFeatures.current_period_end
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Next Billing Date
                        </p>
                        <p className="font-medium">
                          {subscriptionWithFeatures.cancel_at_period_end
                            ? "Subscription ends on " +
                              formatDate(
                                subscriptionWithFeatures.current_period_end
                              )
                            : formatDate(
                                subscriptionWithFeatures.current_period_end
                              )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Recurring Payment Info Helper */}
              {subscriptionWithFeatures.plan.price_monthly > 0 && (
                <div className="text-sm text-muted-foreground">
                  {subscriptionWithFeatures.pesapal_recurring_enabled ? (
                    <p>
                      ℹ️ Your subscription will be automatically renewed using
                      your card handled by Pesapal. You can manage your
                      recurring payments at{" "}
                      <a
                        href="https://www.pesapal.com"
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        Pesapal.com
                      </a>
                      .
                    </p>
                  ) : subscriptionWithFeatures.payment_method === "MPESA" ? (
                    <p>
                      ℹ️ M-Pesa payments do not support auto-renewal. You will
                      receive a reminder email before your subscription expires
                      to renew manually.
                    </p>
                  ) : (
                    <p>
                      ℹ️ Enable auto-renewal during your next payment to avoid
                      service interruptions. Note: Auto-renewal is only
                      supported for card payments (Visa/MasterCard).
                    </p>
                  )}
                </div>
              )}

              {/* Features */}
              <div>
                <h4 className="mb-3 font-medium">Included in your plan:</h4>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {subscriptionWithFeatures.plan.features
                    .filter((f) => !isQuotaFeature(getLocalizedValue(f)))
                    .map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
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
                        {getLocalizedValue(feature)}
                      </li>
                    ))}
                </ul>
              </div>

              {/* Actions - Different for free vs paid */}
              <div className="flex flex-wrap gap-3 border-t pt-4">
                <Button variant="default" onClick={scrollToPlans}>
                  Upgrade Plan
                </Button>
                {subscriptionWithFeatures.plan.price_monthly > 0 && (
                  <>
                    {subscriptionWithFeatures.cancel_at_period_end ? (
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
                  </>
                )}
              </div>

              {/* Cancel Warning */}
              {subscriptionWithFeatures.cancel_at_period_end && (
                <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Your subscription has been cancelled and will end on{" "}
                    {formatDate(subscriptionWithFeatures.current_period_end)}.
                    You can reactivate anytime before this date.
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
                Choose a plan below to unlock features like blog posting,
                priority event registration, and more.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Available Plans */}
        <div id="available-plans">
          <h2 className="mb-4 text-lg font-semibold">
            {subscription ? "Upgrade to a Premium Plan" : "Available Plans"}
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
                        {isCurrentPlan && (
                          <Badge variant="secondary">Current</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-3xl font-bold">
                          {formatCurrency(plan.price_monthly, plan.currency)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          per month
                        </p>
                      </div>
                      <ul className="space-y-2">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
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
                        disabled={isCurrentPlan || upgradingPlanId === plan.id}
                        onClick={() => !isCurrentPlan && handleSelectPlan(plan)}
                      >
                        {upgradingPlanId === plan.id
                          ? "Processing..."
                          : isCurrentPlan
                            ? "Current Plan"
                            : plan.requires_student_approval
                              ? "Join with Verification"
                              : plan.price_monthly === 0
                                ? "Select Free Plan"
                                : "Select Plan"}
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
            <Card className="mx-4 max-w-md">
              <CardHeader>
                <CardTitle>Cancel Subscription?</CardTitle>
                <CardDescription>
                  Are you sure you want to cancel your subscription? You&apos;ll
                  lose access to premium features at the end of your current
                  billing period.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Keep Subscription
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                >
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
