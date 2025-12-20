"use client"

import { useState } from "react"
import { showWarning, showSuccess } from "@/lib/sweetalert"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/store/auth"
import { useMembership } from "@/store/membership"
import { useCreateSubscription } from "@/hooks/useCreateSubscription"

interface SelectMembershipButtonProps {
  membership: {
    id: number
    name: string
    base_monthly_price: number
    yearly_price: number
    savings_percent: number
    currency?: string
    features: string[]
  }
}

export function SelectMembershipButton({ membership }: SelectMembershipButtonProps) {
  const [loading, setLoading] = useState(false)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const user = useAuth((s) => s.user)
  const mutation = useCreateSubscription()

  const handleSelect = async () => {
    if (!user) {
      showWarning("Please sign in to subscribe.")
      window.location.href = "/oauth/google"
      return
    }

    setLoading(true)

    try {
      const { data } = await mutation.mutateAsync({ 
        plan_id: membership.id, 
        billing_interval: billingInterval 
      })

      const payload = data
      if (payload?.message?.includes("Please complete payment")) {
        if (payload.next_url) {
          window.location.href = payload.next_url
          return
        }
      } else if (payload?.message?.includes("Subscribed to free plan")) {
        showSuccess("Successfully subscribed to free plan!")
        window.location.reload()
        return
      }

      showSuccess("Subscription created successfully!")
    } catch (error: unknown) {
      console.error("Subscription error:", error)
      let message = "An error occurred. Please try again."
      if (typeof error === "object" && error !== null) {
        const e = error as { data?: { message?: string; error?: string }; message?: string }
        message = e?.data?.message ?? e?.data?.error ?? e?.message ?? message
      }
      showWarning(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Billing Interval Selector */}
      <div className="flex gap-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name={`billing-${membership.id}`}
            value="monthly"
            checked={billingInterval === 'monthly'}
            onChange={(e) => setBillingInterval(e.target.value as 'monthly')}
            className="text-primary"
          />
          Monthly: {membership.currency ?? 'KES'} {membership.base_monthly_price.toLocaleString()}/mo
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name={`billing-${membership.id}`}
            value="yearly"
            checked={billingInterval === 'yearly'}
            onChange={(e) => setBillingInterval(e.target.value as 'yearly')}
            className="text-primary"
          />
          Yearly: {membership.currency ?? 'KES'} {membership.yearly_price.toLocaleString()}/yr
          <span className="text-green-600 font-medium">
            (Save {membership.savings_percent}%)
          </span>
        </label>
      </div>

      {/* Subscribe Button */}
      <Button onClick={handleSelect} disabled={loading} className="w-full">
        {loading ? "Processing..." : `Subscribe ${billingInterval === 'monthly' ? 'Monthly' : 'Yearly'}`}
      </Button>
    </div>
  )
}

export default SelectMembershipButton
