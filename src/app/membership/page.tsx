"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { usePlans } from "@/hooks/usePlans"
import SelectMembershipButton from "@/components/select-membership-button"
import { PageShell } from "@/components/page-shell"
import { useCurrency } from "@/store/currency"
import { CurrencySwitcher } from "@/components/currency-switcher"

export default function MembershipPage() {
  const { data: plans = [], isLoading: loading, error } = usePlans()
  const { currency: activeCurrency, rate: exchangeRate } = useCurrency()

  if (loading) {
// ... existing code ...
  }

  if (error) {
// ... existing code ...
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
            // Extract name (can be string or localized object)
            const name = typeof plan.name === "string" 
              ? plan.name 
              : (plan.name.en || Object.values(plan.name)[0] || "Unnamed Plan")
            
            // Extract pricing based on active currency
            const pricing = activeCurrency === "KES" ? plan.pricing?.kes : plan.pricing?.usd
            
            const baseMonthly = pricing?.base_monthly ?? 0
            const baseYearly = pricing?.base_yearly ?? (baseMonthly * 12)
            
            // Calculate discounted prices if available
            const discountedMonthly = pricing?.discounted_monthly
            const discountedYearly = pricing?.discounted_yearly
            
            // Use discounted prices if available, otherwise use base prices
            const monthlyPrice = discountedMonthly ?? baseMonthly
            const yearlyPrice = discountedYearly ?? baseYearly
            
            // Calculate savings percent (comparing yearly vs 12 months)
            const yearlyEquivalent = monthlyPrice * 12
            const savingsPercent = yearlyEquivalent > 0 
              ? Math.round(((yearlyEquivalent - yearlyPrice) / yearlyEquivalent) * 100) 
              : 0

            // Extract features safely
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

            const formatPrice = (val: number) => {
              return activeCurrency === "KES" 
                ? `KES ${val.toLocaleString()}` 
                : `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }

            const membership = {
              id: plan.id,
              name,
              base_monthly_price: monthlyPrice,
              yearly_price: yearlyPrice,
              savings_percent: savingsPercent,
              currency: activeCurrency,
              features,
            }

            return (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{name}</CardTitle>
                  <CardDescription>{plan.description || ""}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="mb-4">
                    <div className="text-2xl font-bold mb-1">
                      {formatPrice(monthlyPrice)}
                      <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                       or {formatPrice(yearlyPrice)}/year
                    </div>
                    {savingsPercent > 0 && (
                      <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded inline-block font-medium">
                        Save {savingsPercent}% with annual billing
                      </div>
                    )}
                  </div>
                  <ul className="mb-6 list-disc space-y-2 pl-5 text-sm text-muted-foreground flex-1">
                    {features.length > 0 ? (
                      features.map((f, idx) => (
                        <li key={idx} className="leading-tight">{f}</li>
                      ))
                    ) : (
                      <li className="text-muted-foreground/60">No features listed</li>
                    )}
                  </ul>
                  <div className="mt-auto pt-4">
                    <SelectMembershipButton membership={membership} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </PageShell>
  )
}
