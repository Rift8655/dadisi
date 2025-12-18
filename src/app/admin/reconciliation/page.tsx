"use client"

import { useEffect, useState } from "react"
import { useAdmin } from "@/store/admin"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Swal from "sweetalert2"
import { Icons } from "@/components/icons"
import { formatDate } from "@/lib/utils"
import { Download, Activity, CheckCircle2, AlertOctagon, BarChart3 } from "lucide-react"

export default function ReconciliationPage() {
  const { 
    reconciliationRuns, 
    reconciliationStats,
    reconciliationLoading, 
    fetchReconciliationRuns, 
    fetchReconciliationStats,
    triggerReconciliation,
    downloadReconciliationExport
  } = useAdmin()
  const [triggering, setTriggering] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchReconciliationRuns().catch(console.error)
    fetchReconciliationStats().catch(console.error)
  }, [fetchReconciliationRuns, fetchReconciliationStats])

  const handleTrigger = async (mode: "dry_run" | "sync") => {
    setTriggering(true)
    try {
      await triggerReconciliation(mode)
      Swal.fire("Success", `Reconciliation (${mode}) started`, "success")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? "Failed to start reconciliation")
      Swal.fire("Error", message || "Failed to start reconciliation", "error")
    } finally {
      setTriggering(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const csvData = await downloadReconciliationExport()
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reconciliation_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? "Failed to export data")
      Swal.fire("Error", message || "Failed to export data", "error")
    } finally {
      setExporting(false)
    }
  }

  return (
    <AdminDashboardShell title="Billing Reconciliation">
      <div className="space-y-6 p-4">
        {/* Stats Dashboard */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reconciliationStats?.total_runs || 0}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime executions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matched</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reconciliationStats?.matched_items || 0}</div>
              <p className="text-xs text-muted-foreground">
                Successful matches
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Unmatched</CardTitle>
              <AlertOctagon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reconciliationStats?.unmatched_items || 0}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Run</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">
                {reconciliationStats?.last_run ? formatDate(reconciliationStats.last_run) : "Never"}
              </div>
              <p className="text-xs text-muted-foreground">
                Most recent activity
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Reconciliation Jobs</h2>
            <p className="text-sm text-muted-foreground">
              Match app transactions against payment gateway records.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExport} disabled={exporting}>
              {exporting ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleTrigger("dry_run")} 
              disabled={triggering || reconciliationLoading}
            >
              {triggering ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : null}
              Dry Run
            </Button>
            <Button 
              onClick={() => handleTrigger("sync")}
              disabled={triggering || reconciliationLoading}
            >
              {triggering ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : null}
              Run Sync
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Runs</CardTitle>
            <CardDescription>History of reconciliation executions.</CardDescription>
          </CardHeader>
          <CardContent>
            {reconciliationLoading ? (
               <div className="flex justify-center p-8">
                 <Icons.spinner className="h-8 w-8 animate-spin" />
               </div>
            ) : reconciliationRuns.length === 0 ? (
               <div className="p-8 text-center text-muted-foreground">No reconciliation runs found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Items</TableHead>
                    <TableHead>Matched</TableHead>
                    <TableHead>Unmatched</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciliationRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell>#{run.id}</TableCell>
                      <TableCell>{formatDate(run.created_at)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          run.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {run.status}
                        </span>
                      </TableCell>
                      <TableCell>{run.total_items}</TableCell>
                      <TableCell className="text-green-600">{run.matched_items}</TableCell>
                      <TableCell className="text-red-600">{run.unmatched_items}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardShell>
  )
}
