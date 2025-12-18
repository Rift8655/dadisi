import { z } from "zod"

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
})

export const PermissionsArraySchema = z.array(PermissionSchema)

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  guard_name: z.string().optional(),
  permissions: z.array(PermissionSchema).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const RolesArraySchema = z.array(RoleSchema)

export type Permission = z.infer<typeof PermissionSchema>
export type Role = z.infer<typeof RoleSchema>
