"use client"

import { useEffect, useState } from "react"
import { 
  useAdminExchangeRatesInfo, 
  useRefreshExchangeRates, 
  useUpdateManualExchangeRate, 
  useUpdateExchangeRateCache 
} from "@/hooks/useAdminExchangeRates"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw, Save, Clock, Info, CheckCircle, Loader2 } from "lucide-react"
import Swal from "sweetalert2"

export default function ExchangeRatesPage() {
  const [manualRate, setManualRate] = useState<string>("")
  const [cacheMinutes, setCacheMinutes] = useState<string>("10080")

  const { data: info, isLoading: infoLoading } = useAdminExchangeRatesInfo()
  const refreshMutation = useRefreshExchangeRates()
  const manualUpdateMutation = useUpdateManualExchangeRate()
  const cacheUpdateMutation = useUpdateExchangeRateCache()

  useEffect(() => {
    if (info) {
      setManualRate(info.usd_to_kes_rate.toString())
      setCacheMinutes(info.cache_minutes.toString())
    }
  }, [info])

  const handleRefresh = async () => {
    try {
      await refreshMutation.mutateAsync()
      Swal.fire({
        icon: "success",
        title: "Refreshed",
        text: "Exchange rate updated from API",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error: any) {
      Swal.fire("Error", error.message || "Failed to refresh from API", "error")
    }
  }

  const handleManualUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const rate = parseFloat(manualRate)
    if (isNaN(rate) || rate <= 0) {
      Swal.fire("Invalid Rate", "Please enter a valid positive number", "warning")
      return
    }
    
    try {
      await manualUpdateMutation.mutateAsync(rate)
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Manual exchange rate applied",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error: any) {
      Swal.fire("Error", error.message || "Failed to update manual rate", "error")
    }
  }

  const handleCacheUpdate = async () => {
    const minutes = parseInt(cacheMinutes)
    try {
      await cacheUpdateMutation.mutateAsync(minutes)
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Cache settings updated",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error: any) {
      Swal.fire("Error", error.message || "Failed to update cache settings", "error")
    }
  }

  if (infoLoading && !info) {
    return (
      <AdminDashboardShell title="Exchange Rates">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminDashboardShell>
    )
  }

  return (
    <AdminDashboardShell title="Exchange Rates">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manual Override</CardTitle>
                  <CardDescription>Directly set the USD to KES conversion rate</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh} 
                  disabled={refreshMutation.isPending}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
                  API Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-rate">Exchange Rate (1 USD = X KES)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="manual-rate"
                      type="number"
                      step="0.01"
                      value={manualRate}
                      onChange={(e) => setManualRate(e.target.value)}
                      placeholder="e.g. 145.50"
                    />
                    <Button type="submit" disabled={manualUpdateMutation.isPending}>
                      {manualUpdateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save
                    </Button>
                  </div>
                </div>
                <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>This rate will be used for all public-facing displays and donation calculations.</span>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Caching Strategy</CardTitle>
              <CardDescription>Control how often the system auto-refreshes from market API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cache-minutes">Cache Duration</Label>
                  <div className="flex gap-2">
                    <select
                      id="cache-minutes"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={cacheMinutes}
                      onChange={(e) => setCacheMinutes(e.target.value)}
                    >
                      <option value="4320">3 Days (Conservative)</option>
                      <option value="7200">5 Days (Balanced)</option>
                      <option value="10080">7 Days (Standard)</option>
                    </select>
                    <Button variant="outline" onClick={handleCacheUpdate} disabled={cacheUpdateMutation.isPending}>
                      {cacheUpdateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update"}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                   <Clock className="h-4 w-4 text-muted-foreground" />
                   <span>Next auto-refresh: <span className="font-medium">{info?.next_auto_refresh || "Never"}</span></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Rate Health & Status</CardTitle>
              <CardDescription>Current system state and conversion verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <div className="text-xs font-medium text-muted-foreground uppercase mb-1">USD to KES</div>
                    <div className="text-2xl font-bold">{info?.usd_to_kes_rate?.toFixed(2) || "145.00"}</div>
                    <div className="text-xs text-muted-foreground mt-1">Live base rate</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-xs font-medium text-muted-foreground uppercase mb-1">KES to USD</div>
                    <div className="text-2xl font-bold font-mono">{info?.kes_to_usd_rate?.toFixed(6) || "0.006897"}</div>
                    <div className="text-xs text-muted-foreground mt-1">Inverse rate</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm py-2 border-b">
                    <span className="text-muted-foreground">Status</span>
                    <span className="flex items-center gap-1.5 font-medium text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2 border-b">
                    <span className="text-muted-foreground">Source</span>
                    <span className="font-medium capitalize">{info?.api_source || "exchangerate-api.com"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2 border-b">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">{info?.last_updated}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2">
                    <span className="text-muted-foreground">Data Origin</span>
                    <span className="font-medium text-blue-600">{info?.source}</span>
                  </div>
                </div>

                <div className="mt-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-800">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    System Impact
                  </h4>
                  <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                    Changing the exchange rate immediately updates how membership plans and donations are priced in USD. 
                    It does not affect historical records or already processed payments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardShell>
  )
}
