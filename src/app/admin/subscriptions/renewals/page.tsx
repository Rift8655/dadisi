"use client"

import { useAdminRenewals, useRetryRenewal, useCancelRenewal, useExtendRenewalGracePeriod } from "@/hooks/useAdminRenewals"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, XCircle, Clock, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Swal from "sweetalert2"

export default function RenewalsPage() {
  const { data: renewalJobs = [], isLoading: renewalJobsLoading, refetch } = useAdminRenewals()
  const retryMutation = useRetryRenewal()
  const cancelMutation = useCancelRenewal()
  const extendGraceMutation = useExtendRenewalGracePeriod()

  const handleRetry = async (id: number) => {
    try {
      await retryMutation.mutateAsync(id)
      Swal.fire("Retried", "Renewal job has been queued for retry", "success")
    } catch (error) {
      Swal.fire("Error", "Failed to retry renewal job", "error")
    }
  }

  const handleCancel = async (id: number) => {
    try {
      await cancelMutation.mutateAsync(id)
      Swal.fire("Cancelled", "Renewal job has been cancelled", "success")
    } catch (error) {
      Swal.fire("Error", "Failed to cancel renewal job", "error")
    }
  }

  const handleExtendGracePeriod = async (subscriptionId: number) => {
    const { value: days } = await Swal.fire({
      title: 'Extend Grace Period',
      input: 'number',
      inputLabel: 'Number of days to extend',
      inputValue: 7,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value || parseInt(value) < 1) {
          return 'You must enter at least 1 day!'
        }
      }
    })

    if (days) {
      // Optional note
      const { value: note } = await Swal.fire({
        title: 'Add a Note (Optional)',
        input: 'text',
        inputLabel: 'Reason for extension',
        showCancelButton: true,
      })

      try {
        await extendGraceMutation.mutateAsync({ id: subscriptionId, days: parseInt(days), note: note || undefined })
        Swal.fire("Success", `Grace period extended by ${days} days.`, "success")
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to extend grace period"
        Swal.fire("Error", message, "error")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-500"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Processing</Badge>
      case "failed":
        return <Badge className="bg-red-500"><AlertTriangle className="w-3 h-3 mr-1" /> Failed</Badge>
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
    }
  }

  return (
    <AdminDashboardShell title="Renewal Jobs">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Subscription Renewals</CardTitle>
                <CardDescription>Manage automated subscription renewal attempts</CardDescription>
              </div>
              <Button onClick={() => refetch()} disabled={renewalJobsLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${renewalJobsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                  <tr>
                    <th className="p-4 text-left font-medium">User / Plan</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-left font-medium">Attempts</th>
                    <th className="p-4 text-left font-medium">Last Attempt</th>
                    <th className="p-4 text-left font-medium">Next Attempt</th>
                    <th className="p-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {renewalJobsLoading && renewalJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                          Loading renewals...
                        </div>
                      </td>
                    </tr>
                  ) : renewalJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">No renewal jobs found</td>
                    </tr>
                  ) : (
                    renewalJobs.map((job: any) => (
                      <tr key={job.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="p-4">
                          <div className="font-medium">{job.user?.name || `User #${job.user_id}`}</div>
                          <div className="text-xs text-gray-500">{job.plan_name || 'Membership'}</div>
                        </td>
                        <td className="p-4">{getStatusBadge(job.status)}</td>
                        <td className="p-4">{job.attempts}</td>
                        <td className="p-4 text-gray-500">
                          {job.last_attempt_at ? format(new Date(job.last_attempt_at), "MMM d, HH:mm") : "-"}
                          {job.error_message && (
                             <div className="text-xs text-red-500 max-w-[200px] truncate" title={job.error_message}>
                               {job.error_message}
                             </div>
                          )}
                        </td>
                        <td className="p-4 text-gray-500">
                          {job.next_attempt_at ? format(new Date(job.next_attempt_at), "MMM d, HH:mm") : "-"}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {job.status === 'failed' && (
                            <>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleRetry(job.id)}
                                  disabled={retryMutation.isPending}
                                >
                                  {retryMutation.isPending && retryMutation.variables === job.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />} 
                                  Retry
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleExtendGracePeriod(job.subscription_id)} 
                                  className="text-blue-600 hover:text-blue-700"
                                  disabled={extendGraceMutation.isPending}
                                >
                                   {extendGraceMutation.isPending && (extendGraceMutation.variables as any)?.id === job.subscription_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3 mr-1" />}
                                   Extend
                                </Button>
                            </>
                          )}
                          {['pending', 'failed'].includes(job.status) && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-500 hover:text-red-600" 
                              onClick={() => handleCancel(job.id)}
                              disabled={cancelMutation.isPending}
                            >
                              {cancelMutation.isPending && cancelMutation.variables === job.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardShell>
  )
}
