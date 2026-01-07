"use client"

import { format } from "date-fns"
import {
  Activity,
  AlertCircle,
  Calendar,
  Cloud,
  Code2,
  Fingerprint,
  Info,
  User,
} from "lucide-react"

import type { AdminAuditLog } from "@/types/admin"
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

interface AuditLogDetailsDialogProps {
  log: AdminAuditLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditLogDetailsDialog({
  log,
  open,
  onOpenChange,
}: AuditLogDetailsDialogProps) {
  if (!log) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Audit Log Details</DialogTitle>
          <DialogDescription>
            Record ID: #{log.id} • Detailed history of system activity.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="mt-4 flex-1">
          <div className="space-y-6 pb-4 pr-4">
            {/* Header Info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">
                    Actor (User)
                  </p>
                  <p className="text-sm font-semibold">
                    {log.user?.username || "Unknown System User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.user?.email || `User ID: ${log.user_id}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-3">
                <div className="rounded-md bg-blue-500/10 p-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">
                    Action Performed
                  </p>
                  <p className="text-sm font-semibold capitalize">
                    {log.action.replace(/[._]/g, " ")}
                  </p>
                  <Badge variant="outline" className="mt-1 h-4 text-[10px]">
                    {log.model_type?.split("\\").pop()}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-3">
                <div className="rounded-md bg-orange-500/10 p-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">
                    Timestamp
                  </p>
                  <p className="text-sm font-semibold">
                    {format(new Date(log.created_at), "PPP p")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-3">
                <div className="rounded-md bg-zinc-500/10 p-2">
                  <Fingerprint className="h-4 w-4 text-zinc-500" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">
                    IP Address
                  </p>
                  <p className="font-mono text-sm font-semibold">
                    {log.ip_address}
                  </p>
                </div>
              </div>
            </div>

            {/* Changes Section */}
            {(log.old_values || log.new_values) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Code2 className="h-4 w-4" />
                  Data Changes
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-1.5">
                    <p className="px-1 text-[10px] font-medium uppercase text-muted-foreground">
                      Before (Old Values)
                    </p>
                    <div className="max-h-[300px] overflow-auto rounded-md bg-zinc-950 p-3">
                      <pre className="font-mono text-[10px] leading-relaxed text-zinc-300">
                        {log.old_values
                          ? JSON.stringify(log.old_values, null, 2)
                          : "No previous data"}
                      </pre>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="px-1 text-[10px] font-medium uppercase text-muted-foreground">
                      After (New Values)
                    </p>
                    <div className="max-h-[300px] overflow-auto rounded-md bg-zinc-950 p-3">
                      <pre className="font-mono text-[10px] leading-relaxed text-zinc-400">
                        {log.new_values
                          ? JSON.stringify(log.new_values, null, 2)
                          : "No new data"}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Meta Info */}
            <Separator />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Info className="h-4 w-4" />
                  Resource Context
                </div>
                <div className="space-y-2 rounded-lg border bg-muted/30 p-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model Class:</span>
                    <span
                      className="ml-4 truncate font-mono"
                      title={log.model_type}
                    >
                      {log.model_type}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground">Resource ID:</span>
                    <span className="font-mono font-bold">#{log.model_id}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Cloud className="h-4 w-4" />
                  Request Environment
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                  <span className="mb-1 block text-muted-foreground">
                    User Agent:
                  </span>
                  <p className="break-all font-mono leading-tight text-muted-foreground/80">
                    {log.user_agent || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {log.notes && (
              <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-orange-600">
                  <AlertCircle className="h-3 w-3" />
                  Administrator Notes
                </div>
                <p className="text-sm text-muted-foreground">{log.notes}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
