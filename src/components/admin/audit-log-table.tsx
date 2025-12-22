"use client"

import { useState } from "react"
import { ChevronDown, Eye } from "lucide-react"

import { AdminAuditLog } from "@/types/admin"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AuditLogTableProps {
  logs: AdminAuditLog[]
  isLoading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
}

export function AuditLogTable({
  logs,
  isLoading = false,
  onLoadMore,
  hasMore = false,
}: AuditLogTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr className="border-b">
              <th className="px-4 py-2 text-left font-medium">User</th>
              <th className="px-4 py-2 text-left font-medium">Model</th>
              <th className="px-4 py-2 text-left font-medium">Action</th>
              <th className="px-4 py-2 text-left font-medium">IP Address</th>
              <th className="px-4 py-2 text-left font-medium">Date</th>
              <th className="px-4 py-2 text-center font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  {isLoading ? "Loading audit logs..." : "No audit logs found"}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <div key={log.id}>
                  <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-2">
                      <div className="font-medium">
                        {log.user?.username || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.user?.email}
                      </div>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">{log.model_type}</td>
                    <td className="px-4 py-2">
                      <span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">
                      {log.ip_address}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedId(expandedId === log.id ? null : log.id)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr className="border-b bg-gray-50 dark:bg-gray-900">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="space-y-2">
                          <div>
                            <h4 className="mb-2 font-semibold">Changes:</h4>
                            <pre className="max-h-48 overflow-auto rounded border bg-white p-2 text-xs dark:bg-gray-950">
                              {JSON.stringify({ old: log.old_values, new: log.new_values }, null, 2)}
                            </pre>
                          </div>
                          {log.user_agent && (
                            <div>
                              <h4 className="mb-1 text-xs font-semibold">
                                User Agent:
                              </h4>
                              <p className="break-all text-xs text-gray-600 dark:text-gray-400">
                                {log.user_agent}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </div>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={onLoadMore} disabled={isLoading} variant="outline">
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  )
}
