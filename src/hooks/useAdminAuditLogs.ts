import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api-admin"
import { z } from "zod"
import { PaginatedSchema, AdminAuditLogSchema } from "@/schemas/admin"

export function useAdminAuditLogs(params: {
  model?: string
  user_id?: number
  action?: string
  page?: number
  per_page?: number
}) {
  return useQuery({
    queryKey: ["admin-audit-logs", params],
    queryFn: async () => {
      const response = await adminApi.auditLogs.list(params)
      return PaginatedSchema(AdminAuditLogSchema).parse(response)
    },
    staleTime: 30 * 1000, // Tier 4: Dynamic - near real-time logging
  })
}
