"use client"

import { format } from "date-fns"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Code2,
  ExternalLink,
  Info,
  ShieldCheck,
  XCircle,
} from "lucide-react"

import type { AdminWebhookEvent } from "@/types/admin"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface WebhookDetailsDialogProps {
  event: AdminWebhookEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WebhookDetailsDialog({
  event,
  open,
  onOpenChange,
}: WebhookDetailsDialogProps) {
  if (!event) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Processed
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="danger" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {status}
          </Badge>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div>
              <DialogTitle className="text-xl">
                Webhook Event Details
              </DialogTitle>
              <DialogDescription>
                Full technical details for event ID: {event.id}
              </DialogDescription>
            </div>
            {getStatusBadge(event.status)}
          </div>
        </DialogHeader>

        <ScrollArea className="mt-4 flex-1">
          <div className="space-y-6 pb-4 pr-4">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">
                    Provider
                  </p>
                  <p className="text-sm font-semibold capitalize">
                    {event.provider}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-3">
                <div className="rounded-md bg-blue-500/10 p-2">
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">
                    Event Type
                  </p>
                  <p className="text-sm font-semibold">{event.event_type}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-3">
                <div className="rounded-md bg-orange-500/10 p-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">
                    Received At
                  </p>
                  <p className="text-sm font-semibold">
                    {format(new Date(event.created_at), "PPP p")}
                  </p>
                </div>
              </div>

              {event.processed_at && (
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="rounded-md bg-green-500/10 p-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">
                      Processed At
                    </p>
                    <p className="text-sm font-semibold">
                      {format(new Date(event.processed_at), "PPP p")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message if failed */}
            {event.error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                <div className="mb-1 flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-semibold">
                    Processing Error
                  </span>
                </div>
                <p className="break-all font-mono text-xs">{event.error}</p>
              </div>
            )}

            {/* Payload Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Code2 className="h-4 w-4 text-muted-foreground" />
                JSON Payload
              </div>
              <div className="overflow-auto rounded-md bg-zinc-950 p-4">
                <pre className="font-mono text-xs text-zinc-300">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </div>
            </div>

            {/* Identifiers */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Info className="h-4 w-4 text-muted-foreground" />
                Internal & Provider IDs
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {(event as any).external_id && (
                  <div className="flex items-center justify-between border-b py-2">
                    <span className="text-muted-foreground">
                      Provider Tracking ID (External)
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                      {(event as any).external_id}
                    </span>
                  </div>
                )}
                {(event as any).order_reference && (
                  <div className="flex items-center justify-between border-b py-2">
                    <span className="text-muted-foreground">
                      Order Merchant Reference
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                      {(event as any).order_reference}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
