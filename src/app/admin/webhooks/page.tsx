"use client"

import { useEffect } from "react"
import { useAdmin } from "@/store/admin"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default function WebhooksPage() {
  const { webhookEvents, webhookEventsLoading, fetchWebhookEvents } = useAdmin()

  useEffect(() => {
    fetchWebhookEvents()
  }, [])

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
              <Button onClick={() => fetchWebhookEvents()} disabled={webhookEventsLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${webhookEventsLoading ? 'animate-spin' : ''}`} />
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
                  {webhookEventsLoading && (!webhookEvents || webhookEvents.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">Loading webhooks...</td>
                    </tr>
                  ) : !webhookEvents || webhookEvents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">No webhook events found</td>
                    </tr>
                  ) : (
                    webhookEvents.map((event) => (
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
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded max-w-[200px] block truncate">
                            {JSON.stringify(event.payload)}
                          </code>
                          {event.error && (
                            <div className="text-xs text-red-500 mt-1 truncate max-w-[200px]">{event.error}</div>
                          )}
                        </td>
                        <td className="p-4 text-right text-gray-500">
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
