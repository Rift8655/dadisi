"use client"

import { useState } from "react"
import { useCurrency } from "@/store/currency"

import { usePlans } from "@/hooks/usePlans"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CurrencySwitcher } from "@/components/currency-switcher"
import { PageShell } from "@/components/page-shell"
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
  requires_student_approval: boolean
}

export default function MembershipPage() {
  const { data: plans = [], isLoading: loading, error } = usePlans()
  const { currency: activeCurrency } = useCurrency()
  const [selectedPlan, setSelectedPlan] = useState<PlanForDialog | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (loading) {
    return (
      <PageShell title="Membership">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell title="Membership">
        <div className="py-8 text-center text-red-500">
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
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
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
            const name =
              typeof plan.name === "string"
                ? plan.name
                : plan.name.en || Object.values(plan.name)[0] || "Unnamed Plan"

            // Extract description (handle both string and localized JSON)
            const description =
              typeof plan.description === "string"
                ? plan.description
                : plan.description && typeof plan.description === "object"
                  ? (plan.description as { en?: string }).en ||
                    (Object.values(plan.description as object)[0] as string) ||
                    ""
                  : ""

            // Extract pricing
            const pricing =
              activeCurrency === "KES" ? plan.pricing?.kes : plan.pricing?.usd
            const baseMonthly = pricing?.base_monthly ?? 0
            const baseYearly = pricing?.base_yearly ?? baseMonthly * 12
            const discountedMonthly = pricing?.discounted_monthly
            const discountedYearly = pricing?.discounted_yearly

            // Check if promotions are active
            const promotions = plan.promotions as
              | {
                  monthly?: {
                    active?: boolean
                    discount_percent?: number
                  } | null
                  yearly?: {
                    active?: boolean
                    discount_percent?: number
                  } | null
                }
              | undefined

            const monthlyPromoActive = promotions?.monthly?.active ?? false
            const yearlyPromoActive = promotions?.yearly?.active ?? false
            const hasAnyPromotion = monthlyPromoActive || yearlyPromoActive

            // Show promotional price when active
            const displayMonthlyPrice =
              monthlyPromoActive && discountedMonthly
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
                const feat = f as {
                  name?: string | { en?: string }
                  limit?: number | null
                }
                const featureName =
                  typeof feat.name === "string"
                    ? feat.name
                    : feat.name?.en || "Feature"
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
                monthly:
                  monthlyPromoActive && promotions?.monthly
                    ? {
                        active: true,
                        discount_percent:
                          promotions.monthly.discount_percent ?? 0,
                      }
                    : null,
                yearly:
                  yearlyPromoActive && promotions?.yearly
                    ? {
                        active: true,
                        discount_percent:
                          promotions.yearly.discount_percent ?? 0,
                      }
                    : null,
              },
              currency: activeCurrency,
              requires_student_approval: !!plan.requires_student_approval,
            }

            return (
              <Card key={plan.id} className="relative flex flex-col">
                {/* Promotion badge - only show when promotions are active */}
                {hasAnyPromotion && (
                  <Badge className="absolute -right-2 -top-2 bg-green-500 hover:bg-green-600">
                    {monthlyPromoActive && promotions?.monthly?.discount_percent
                      ? `${promotions.monthly.discount_percent}% OFF`
                      : yearlyPromoActive &&
                          promotions?.yearly?.discount_percent
                        ? `Save ${promotions.yearly.discount_percent}%`
                        : "On Sale"}
                  </Badge>
                )}

                <CardHeader>
                  <CardTitle className="text-xl">{name}</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col">
                  {/* Price display */}
                  <div className="mb-4">
                    <div className="text-3xl font-bold">
                      {displayMonthlyPrice === 0
                        ? "Free"
                        : formatPrice(displayMonthlyPrice)}
                      {displayMonthlyPrice !== 0 && (
                        <span className="ml-1 text-sm font-normal text-muted-foreground">
                          /month
                        </span>
                      )}
                    </div>
                    {monthlyPromoActive &&
                      discountedMonthly &&
                      discountedMonthly < baseMonthly && (
                        <div className="mt-1 text-sm text-muted-foreground line-through">
                          {formatPrice(baseMonthly)}/month
                        </div>
                      )}
                  </div>

                  {/* Description below price */}
                  {description && (
                    <p className="mb-6 line-clamp-3 text-sm text-muted-foreground">
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
