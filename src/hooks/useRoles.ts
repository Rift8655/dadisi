import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { roleApi, permissionApi } from "@/lib/api-admin"
import { AdminRoleSchema, AdminPermissionSchema, PaginatedSchema } from "@/schemas/admin"
import { z } from "zod"

export function useRoles(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["admin-roles", params || {}],
    queryFn: async () => {
      const res = await roleApi.list(params)
      return PaginatedSchema(AdminRoleSchema).or(z.array(AdminRoleSchema)).parse(res)
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useRole(id?: number) {
  return useQuery({
    queryKey: ["admin-role", id],
    queryFn: async () => {
      if (!id) throw new Error("Missing id")
      const res = await roleApi.get(id)
      return AdminRoleSchema.parse(res)
    },
    enabled: !!id,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await roleApi.create(payload)
      return AdminRoleSchema.parse(res)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      const res = await roleApi.update(id, payload)
      return AdminRoleSchema.parse(res)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
      queryClient.invalidateQueries({ queryKey: ["admin-role", variables.id] })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await roleApi.delete(id)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
    },
  })
}

export function usePermissions(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["admin-permissions", params || {}],
    queryFn: async () => {
      const res = await permissionApi.list(params)
      return PaginatedSchema(AdminPermissionSchema).or(z.array(AdminPermissionSchema)).parse(res)
    },
    staleTime: 1000 * 60 * 60,
  })
}

export function useCreatePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await permissionApi.create(payload)
      return AdminPermissionSchema.parse(res)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-permissions"] })
    },
  })
}

export function useAssignRolePermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, permissionNames }: { id: number; permissionNames: string[] }) => {
      return await roleApi.assignPermissions(id, permissionNames)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
      queryClient.invalidateQueries({ queryKey: ["admin-role", variables.id] })
    },
  })
}
