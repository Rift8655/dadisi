import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api-admin"
import { AdminAuditLogsArraySchema, AdminAuditLogSchema } from "@/schemas/adminAudit"

export function useAuditLogs(params?: unknown) {
  return useQuery({
    queryKey: ["admin-audit-logs", params || {}],
    queryFn: async () => {
      const res = await adminApi.auditLogs.list(params as any)
      const raw = res as unknown
      const payload = (raw as { data?: unknown }).data ?? raw
      const list = Array.isArray(payload) ? payload : (payload as { data?: unknown }).data ?? payload
      return AdminAuditLogsArraySchema.parse(list)
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function useUserAudit(userId?: number, params?: unknown) {
  return useQuery({
    queryKey: ["admin-user-audit", userId, params || {}],
    queryFn: async () => {
      if (!userId) throw new Error("Missing userId")
      const res = await adminApi.auditLogs.list({ ...(params as any), user_id: userId })
      const raw = res as unknown
      const payload = (raw as { data?: unknown }).data ?? raw
      const list = Array.isArray(payload) ? payload : (payload as { data?: unknown }).data ?? payload
      return AdminAuditLogsArraySchema.parse(list)
    },
    enabled: !!userId,
  })
}
