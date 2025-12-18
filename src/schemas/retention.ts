import { z } from "zod"

export const RetentionSettingSchema = z.object({
  id: z.number(),
  data_type: z.string(),
  retention_days: z.number(),
  auto_delete: z.boolean(),
  description: z.string().nullable().optional(),
  updated_by: z.number().nullable().optional(),
  updated_by_user: z
    .object({ username: z.string() })
    .nullable()
    .optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const RetentionSettingsArraySchema = z.array(RetentionSettingSchema)

export type RetentionSetting = z.infer<typeof RetentionSettingSchema>
