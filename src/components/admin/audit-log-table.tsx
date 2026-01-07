"use client"

import { Fragment, useState } from "react"
import { Eye } from "lucide-react"

import { AdminAuditLog } from "@/types/admin"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { AuditLogDetailsDialog } from "./audit-log-details-dialog"

interface AuditLogTableProps {
  logs: AdminAuditLog[]
  isLoading?: boolean
}

export function AuditLogTable({ logs, isLoading = false }: AuditLogTableProps) {
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Model</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
              <th className="px-4 py-3 text-left font-medium">IP Address</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-right font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {isLoading ? "Loading audit logs..." : "No audit logs found"}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {log.user?.username || "System"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {log.user?.email || `ID: ${log.user_id}`}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="max-w-[120px] truncate font-mono text-[10px] text-muted-foreground"
                      title={log.model_type}
                    >
                      {log.model_type?.split("\\").pop()}
                    </div>
                    <div className="text-[10px] font-bold">
                      ID: #{log.model_id}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-[10px] capitalize"
                    >
                      {log.action.replace(/[._]/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px]">
                    {log.ip_address}
                  </td>
                  <td className="px-4 py-3 text-[10px] text-muted-foreground">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedLog(log)
                        setIsDialogOpen(true)
                      }}
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

      <AuditLogDetailsDialog
        log={selectedLog}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}
