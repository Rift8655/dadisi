"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePlans } from "@/hooks/usePlans"
import { PageShell } from "@/components/page-shell"
import { useCurrency } from "@/store/currency"
import { CurrencySwitcher } from "@/components/currency-switcher"
import { PlanDetailDialog } from "@/components/plan-detail-dialog"

type PlanForDialog = {
  id: number
  name: string
  description?: string
  features: string[]
  pricing: {
    monthly: { base: number; discounted?: number }
    yearly: { base: number; discounted?: number }
  }
  promotions: {
    monthly: { active: boolean; discount_percent: number } | null
    yearly: { active: boolean; discount_percent: number } | null
  }
  currency: string
}

export default function MembershipPage() {
  const { data: plans = [], isLoading: loading, error } = usePlans()
  const { currency: activeCurrency } = useCurrency()
  const [selectedPlan, setSelectedPlan] = useState<PlanForDialog | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (loading) {
    return (
      <PageShell title="Membership">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full border-b-2 border-primary h-8 w-8"></div>
        </div>
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell title="Membership">
        <div className="text-center text-red-500 py-8">
          Failed to load membership plans.
        </div>
      </PageShell>
    )
  }

  const handleViewPlan = (plan: PlanForDialog) => {
    setSelectedPlan(plan)
    setDialogOpen(true)
  }

  return (
    <PageShell title="Membership">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="max-w-2xl text-muted-foreground">
            Choose a plan that fits you or your organization.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Currency:</span>
            <CurrencySwitcher />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            // Extract name
            const name = typeof plan.name === "string"
              ? plan.name
              : (plan.name.en || Object.values(plan.name)[0] || "Unnamed Plan")

            // Extract description (handle both string and localized JSON)
            const description = typeof plan.description === "string"
              ? plan.description
              : plan.description && typeof plan.description === "object"
              ? (plan.description as { en?: string }).en || Object.values(plan.description as object)[0] as string || ""
              : ""

            // Extract pricing
            const pricing = activeCurrency === "KES" ? plan.pricing?.kes : plan.pricing?.usd
            const baseMonthly = pricing?.base_monthly ?? 0
            const baseYearly = pricing?.base_yearly ?? (baseMonthly * 12)
            const discountedMonthly = pricing?.discounted_monthly
            const discountedYearly = pricing?.discounted_yearly

            // Check if promotions are active
            const promotions = plan.promotions as {
              monthly?: { active?: boolean; discount_percent?: number } | null
              yearly?: { active?: boolean; discount_percent?: number } | null
            } | undefined

            const monthlyPromoActive = promotions?.monthly?.active ?? false
            const yearlyPromoActive = promotions?.yearly?.active ?? false
            const hasAnyPromotion = monthlyPromoActive || yearlyPromoActive

            // Show promotional price when active
            const displayMonthlyPrice = monthlyPromoActive && discountedMonthly
              ? discountedMonthly
              : baseMonthly

            const formatPrice = (val: number) => {
              return activeCurrency === "KES"
                ? `KES ${val.toLocaleString()}`
                : `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }

            // Extract features
            const features = (plan.features ?? []).map((f: unknown) => {
              if (typeof f === "string") return f
              if (typeof f === "object" && f !== null) {
                const feat = f as { name?: string | { en?: string }; limit?: number | null }
                const featureName = typeof feat.name === "string"
                  ? feat.name
                  : (feat.name?.en || "Feature")
                const limit = feat.limit ? ` (Limit: ${feat.limit})` : ""
                return `${featureName}${limit}`
              }
              return "Feature"
            })

            // Prepare plan data for dialog
            const planForDialog: PlanForDialog = {
              id: plan.id,
              name,
              description: description || undefined,
              features,
              pricing: {
                monthly: { base: baseMonthly, discounted: discountedMonthly },
                yearly: { base: baseYearly, discounted: discountedYearly },
              },
              promotions: {
                monthly: monthlyPromoActive && promotions?.monthly
                  ? { active: true, discount_percent: promotions.monthly.discount_percent ?? 0 }
                  : null,
                yearly: yearlyPromoActive && promotions?.yearly
                  ? { active: true, discount_percent: promotions.yearly.discount_percent ?? 0 }
                  : null,
              },
              currency: activeCurrency,
            }

            return (
              <Card key={plan.id} className="flex flex-col relative">
                {/* Promotion badge - only show when promotions are active */}
                {hasAnyPromotion && (
                  <Badge className="absolute -top-2 -right-2 bg-green-500 hover:bg-green-600">
                    {monthlyPromoActive && promotions?.monthly?.discount_percent
                      ? `${promotions.monthly.discount_percent}% OFF`
                      : yearlyPromoActive && promotions?.yearly?.discount_percent
                      ? `Save ${promotions.yearly.discount_percent}%`
                      : "On Sale"}
                  </Badge>
                )}

                <CardHeader>
                  <CardTitle className="text-xl">{name}</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {/* Price display */}
                  <div className="mb-4">
                    <div className="text-3xl font-bold">
                      {displayMonthlyPrice === 0 ? "Free" : formatPrice(displayMonthlyPrice)}
                      {displayMonthlyPrice !== 0 && <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>}
                    </div>
                    {monthlyPromoActive && discountedMonthly && discountedMonthly < baseMonthly && (
                      <div className="text-sm text-muted-foreground line-through mt-1">
                        {formatPrice(baseMonthly)}/month
                      </div>
                    )}
                  </div>

                  {/* Description below price */}
                  {description && (
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                      {description}
                    </p>
                  )}

                  {/* View button */}
                  <div className="mt-auto">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => handleViewPlan(planForDialog)}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Plan detail dialog */}
      {selectedPlan && (
        <PlanDetailDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          plan={selectedPlan}
        />
      )}
    </PageShell>
  )
}
