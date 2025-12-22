"use client"

import { cn } from "@/lib/utils"

interface CampaignProgressProps {
  currentAmount: number
  goalAmount: number | null
  currency: string
  className?: string
  showLabels?: boolean
}

export function CampaignProgress({
  currentAmount,
  goalAmount,
  currency,
  className,
  showLabels = true,
}: CampaignProgressProps) {
  const hasGoal = goalAmount !== null && goalAmount > 0
  const percentage = hasGoal
    ? Math.min(100, Math.round((currentAmount / goalAmount) * 100))
    : 0

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Progress bar */}
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            percentage >= 100
              ? "bg-gradient-to-r from-green-500 to-emerald-500"
              : "bg-gradient-to-r from-primary to-primary/80"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between text-sm">
          <div>
            <span className="font-semibold text-foreground">
              {formatAmount(currentAmount)}
            </span>
            <span className="text-muted-foreground"> raised</span>
          </div>
          {hasGoal ? (
            <div className="text-right">
              <span className="text-muted-foreground">of </span>
              <span className="font-semibold text-foreground">
                {formatAmount(goalAmount)}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                ({percentage}%)
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">No goal set</span>
          )}
        </div>
      )}
    </div>
  )
}
