"use client"

import { useCurrency, Currency } from "@/store/currency"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export function CurrencySwitcher() {
  const { currency, setCurrency, fetchRate, isLoading } = useCurrency()

  useEffect(() => {
    // Refresh rate on mount if it's been a while (optional enhancement)
    fetchRate()
  }, [])

  const handleToggle = (newCurrency: Currency) => {
    setCurrency(newCurrency)
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-background p-1 shadow-sm">
      <Button
        variant={currency === "KES" ? "default" : "ghost"}
        size="sm"
        className="h-8 px-3 text-xs"
        onClick={() => handleToggle("KES")}
      >
        KES
      </Button>
      <Button
        variant={currency === "USD" ? "default" : "ghost"}
        size="sm"
        className="h-8 px-3 text-xs"
        onClick={() => handleToggle("USD")}
      >
        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "USD"}
      </Button>
    </div>
  )
}
