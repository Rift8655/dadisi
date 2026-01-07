"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react"

import type { AdminWebhookEvent } from "@/types/admin"
import { useAdminWebhooks } from "@/hooks/useAdminWebhooks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { WebhookDetailsDialog } from "@/components/admin/webhook-details-dialog"

export default function WebhooksPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>("all")
  const [provider, setProvider] = useState<string>("all")
  const [eventType, setEventType] = useState<string>("")
  const [selectedEvent, setSelectedEvent] = useState<AdminWebhookEvent | null>(
    null
  )
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const {
    data: response,
    isLoading,
    isRefetching,
    refetch,
  } = useAdminWebhooks({
    page,
    status: status === "all" ? undefined : status,
    provider: provider === "all" ? undefined : provider,
    event_type: eventType || undefined,
    per_page: 15,
  })

  // Normalize data from paginated response
  const webhookEvents = response?.data || []
  const meta = response?.meta || { current_page: 1, last_page: 1, total: 0 }

  const handleRefresh = () => {
    refetch()
  }

  const handleViewDetails = (event: AdminWebhookEvent) => {
    setSelectedEvent(event)
    setIsDetailsOpen(true)
  }

  return (
    <AdminDashboardShell title="Webhooks Debugger">
      <div className="space-y-4">
        {/* Filters Card */}
        <Card className="border-none bg-muted/30 shadow-none">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[200px] flex-1 space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium">
                  <Search className="h-3 w-3" /> Event Type
                </label>
                <Input
                  placeholder="e.g. COMPLETED"
                  value={eventType}
                  onChange={(e) => {
                    setEventType(e.target.value)
                    setPage(1)
                  }}
                  className="h-9 bg-background"
                />
              </div>

              <div className="w-[140px] space-y-1.5">
                <label className="text-xs font-medium">Status</label>
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="h-9 bg-background">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="ignored">Ignored</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[140px] space-y-1.5">
                <label className="text-xs font-medium">Provider</label>
                <Select
                  value={provider}
                  onValueChange={(v) => {
                    setProvider(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="h-9 bg-background">
                    <SelectValue placeholder="All Providers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    <SelectItem value="pesapal">Pesapal</SelectItem>
                    <SelectItem value="mock">Mock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading || isRefetching}
                className="h-9 w-9"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading || isRefetching ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Webhook Events</CardTitle>
                <CardDescription>{meta.total} events recorded</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="mr-2 flex items-center text-xs text-muted-foreground">
                  Page {meta.current_page} of {meta.last_page}
                </div>
                <div className="flex items-center rounded-md border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-r-none border-r"
                    disabled={page <= 1 || isLoading}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-l-none"
                    disabled={page >= meta.last_page || isLoading}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="w-[80px] p-4 text-left font-medium">ID</th>
                      <th className="p-4 text-left font-medium">
                        Provider / Event
                      </th>
                      <th className="p-4 text-left font-medium">Status</th>
                      <th className="p-4 text-left font-medium">
                        Payload Preview
                      </th>
                      <th className="p-4 text-left font-medium">Received At</th>
                      <th className="p-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && !webhookEvents.length ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-12 text-center text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span>Loading webhooks...</span>
                          </div>
                        </td>
                      </tr>
                    ) : webhookEvents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-12 text-center text-muted-foreground"
                        >
                          No webhook events found
                        </td>
                      </tr>
                    ) : (
                      webhookEvents.map((event: any) => (
                        <tr
                          key={event.id}
                          className="border-b transition-colors last:border-0 hover:bg-muted/30"
                        >
                          <td className="p-4 font-mono text-xs">{event.id}</td>
                          <td className="p-4">
                            <div className="text-xs font-semibold">
                              {event.provider?.toUpperCase()}
                            </div>
                            <div
                              className="max-w-[150px] truncate font-mono text-[10px] text-muted-foreground"
                              title={event.event_type}
                            >
                              {event.event_type}
                            </div>
                          </td>
                          <td className="p-4">
                            {event.status === "processed" ? (
                              <Badge
                                variant="success"
                                className="h-5 text-[10px]"
                              >
                                <CheckCircle className="mr-1 h-2.5 w-2.5" />{" "}
                                Processed
                              </Badge>
                            ) : event.status === "failed" ? (
                              <Badge
                                variant="danger"
                                className="h-5 text-[10px]"
                              >
                                <XCircle className="mr-1 h-2.5 w-2.5" /> Failed
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="h-5 text-[10px]"
                              >
                                <AlertCircle className="mr-1 h-2.5 w-2.5" />{" "}
                                {event.status}
                              </Badge>
                            )}
                          </td>
                          <td className="p-4">
                            <code
                              className="block max-w-[200px] cursor-help truncate rounded bg-muted p-1 px-1.5 text-[10px] text-muted-foreground"
                              title={JSON.stringify(event.payload)}
                            >
                              {JSON.stringify(event.payload)}
                            </code>
                            {event.error && (
                              <div
                                className="mt-1 max-w-[200px] truncate text-[10px] text-destructive"
                                title={event.error}
                              >
                                {event.error}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap p-4 text-xs text-muted-foreground">
                            {format(
                              new Date(event.created_at),
                              "MMM d, HH:mm:ss"
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewDetails(event)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Footer */}
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Showing {webhookEvents.length} of {meta.total} events
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.last_page || isLoading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <WebhookDetailsDialog
        event={selectedEvent}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </AdminDashboardShell>
  )
}
