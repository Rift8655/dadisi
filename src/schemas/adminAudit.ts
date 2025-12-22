import { z } from "zod"

export const AdminUserRefSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
})

export const AdminAuditLogSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  user: AdminUserRefSchema.optional(),
  model: z.string(),
  model_id: z.number(),
  action: z.string(),
  changes: z.record(z.any()).optional(),
  old_values: z.record(z.any()).optional(),
  new_values: z.record(z.any()).optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  created_at: z.string(),
})

export const AdminAuditLogsArraySchema = z.array(AdminAuditLogSchema)

export type AdminAuditLog = z.infer<typeof AdminAuditLogSchema>
