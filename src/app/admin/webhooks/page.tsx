"use client"

import { useAdminWebhooks } from "@/hooks/useAdminWebhooks"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default function WebhooksPage() {
  const { data: webhookEvents = [], isLoading, isRefetching, refetch } = useAdminWebhooks()

  const handleRefresh = () => {
    refetch()
  }

  return (
    <AdminDashboardShell title="Webhooks Debugger">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Webhook Events</CardTitle>
                <CardDescription>Monitor incoming webhooks from payment providers</CardDescription>
              </div>
              <Button onClick={handleRefresh} disabled={isLoading || isRefetching}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading || isRefetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                  <tr>
                    <th className="p-4 text-left font-medium">ID</th>
                    <th className="p-4 text-left font-medium">Provider / Event</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-left font-medium">Payload Preview</th>
                    <th className="p-4 text-right font-medium">Received At</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (!webhookEvents || webhookEvents.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                           <Loader2 className="w-8 h-8 animate-spin text-primary" />
                           <span>Loading webhooks...</span>
                        </div>
                      </td>
                    </tr>
                  ) : !webhookEvents || webhookEvents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">No webhook events found</td>
                    </tr>
                  ) : (
                    (webhookEvents as any[]).map((event) => (
                      <tr key={event.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="p-4 font-mono text-xs">{event.id}</td>
                        <td className="p-4">
                           <div className="font-semibold">{event.provider}</div>
                           <div className="text-xs text-gray-500">{event.event_type}</div>
                        </td>
                        <td className="p-4">
                           {event.status === 'processed' ? (
                             <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Processed</Badge>
                           ) : event.status === 'failed' ? (
                             <Badge variant="danger"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>
                           ) : (
                             <Badge variant="default"><AlertCircle className="w-3 h-3 mr-1" /> Ignored</Badge>
                           )}
                        </td>
                        <td className="p-4">
                           <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded max-w-[200px] block truncate text-muted-foreground" title={JSON.stringify(event.payload)}>
                             {JSON.stringify(event.payload)}
                           </code>
                           {event.error && (
                             <div className="text-xs text-red-500 mt-1 truncate max-w-[200px]" title={event.error}>{event.error}</div>
                           )}
                        </td>
                        <td className="p-4 text-right text-gray-500 whitespace-nowrap">
                           {format(new Date(event.created_at), "MMM d, HH:mm:ss")}
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
