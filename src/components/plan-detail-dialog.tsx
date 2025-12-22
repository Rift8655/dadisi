"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/store/auth"
import { showWarning } from "@/lib/sweetalert"
import { Check } from "lucide-react"

interface PlanDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: {
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
}

export function PlanDetailDialog({ open, onOpenChange, plan }: PlanDetailDialogProps) {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")
  const router = useRouter()
  const user = useAuth((s) => s.user)

  const monthlyPromoActive = plan.promotions.monthly?.active ?? false
  const yearlyPromoActive = plan.promotions.yearly?.active ?? false

  const monthlyPrice = monthlyPromoActive && plan.pricing.monthly.discounted
    ? plan.pricing.monthly.discounted
    : plan.pricing.monthly.base

  const yearlyPrice = yearlyPromoActive && plan.pricing.yearly.discounted
    ? plan.pricing.yearly.discounted
    : plan.pricing.yearly.base

  const isFree = monthlyPrice === 0

  const formatPrice = (val: number) => {
    return plan.currency === "KES"
      ? `KES ${val.toLocaleString()}`
      : `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const setAuthDialogOpen = useAuth((s) => s.setAuthDialogOpen)

  const handleSubscribe = () => {
    if (!user) {
      showWarning("Please sign in to subscribe.")
      onOpenChange(false)
      setAuthDialogOpen(true, "signin")
      return
    }

    // Navigate to checkout page with plan and billing info
    onOpenChange(false)
    router.push(`/checkout?plan_id=${plan.id}&billing_interval=${billingInterval}&currency=${plan.currency}`)
  }

  const selectedPrice = billingInterval === "monthly" ? monthlyPrice : yearlyPrice
  const selectedPromo = billingInterval === "monthly" ? plan.promotions.monthly : plan.promotions.yearly

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] lg:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{plan.name}</DialogTitle>
          {plan.description && (
            <DialogDescription className="text-base">{plan.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Features list - Left column */}
          <div className="space-y-3">
            <h4 className="font-medium">What's included:</h4>
            <div className="max-h-60 overflow-y-auto">
              <ul className="space-y-2">
                {plan.features.length > 0 ? (
                  plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground text-sm">No features listed</li>
                )}
              </ul>
            </div>
          </div>

          {/* Billing options and button - Right column */}
          {isFree ? (
            <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-center">
                <div className="text-3xl mb-2">🎉</div>
                <h4 className="font-medium text-lg text-green-800 dark:text-green-200">Free Forever!</h4>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  No payment required. Start exploring biotech today.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="font-medium">Select billing cycle:</h4>

              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${billingInterval === "monthly" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="billing"
                      value="monthly"
                      checked={billingInterval === "monthly"}
                      onChange={() => setBillingInterval("monthly")}
                      className="text-primary"
                    />
                    <div>
                      <div className="font-medium">Monthly</div>
                      <div className="text-sm text-muted-foreground">Billed monthly</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatPrice(monthlyPrice)}/mo</div>
                    {monthlyPromoActive && plan.promotions.monthly && (
                      <div className="text-xs text-green-600">
                        {plan.promotions.monthly.discount_percent}% off
                      </div>
                    )}
                  </div>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${billingInterval === "yearly" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="billing"
                      value="yearly"
                      checked={billingInterval === "yearly"}
                      onChange={() => setBillingInterval("yearly")}
                      className="text-primary"
                    />
                    <div>
                      <div className="font-medium">Yearly</div>
                      <div className="text-sm text-muted-foreground">Billed annually</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatPrice(yearlyPrice)}/yr</div>
                    {yearlyPromoActive && plan.promotions.yearly && (
                      <div className="text-xs text-green-600">
                        {plan.promotions.yearly.discount_percent}% off
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Subscribe button */}
              <Button onClick={handleSubscribe} className="w-full" size="lg">
                {`Subscribe - ${formatPrice(selectedPrice)}${billingInterval === "monthly" ? "/mo" : "/yr"}`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PlanDetailDialog
