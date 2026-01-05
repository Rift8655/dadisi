import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { userApi } from "@/lib/api-admin"

export function useUsers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["admin-users", params || {}],
    queryFn: async () => {
      // userApi.list() already validates the response with safeParse
      return await userApi.list(params)
    },
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ["admin-user", id],
    queryFn: async () => {
      // userApi.get() already validates the response with safeParse
      return await userApi.get(id)
    },
    enabled: !!id,
  })
}

export function useInviteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      return await userApi.invite(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await userApi.update(id, data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-user", variables.id] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      return await userApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

export function useRestoreUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      return await userApi.restore(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

export function useBulkDeleteUsers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: number[]) => {
      return await userApi.bulkDelete(ids)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

export function useBulkRestoreUsers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: number[]) => {
      return await userApi.bulkRestore(ids)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

export function useBulkAssignRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      ids,
      roleName,
    }: {
      ids: number[]
      roleName: string
    }) => {
      return await userApi.bulkAssignRole(ids, roleName)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

export function useBulkRemoveRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      ids,
      roleName,
    }: {
      ids: number[]
      roleName: string
    }) => {
      return await userApi.bulkRemoveRole(ids, roleName)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

export function useForceDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      return await userApi.forceDelete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

export function useSyncUserRoles() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      roleNames,
    }: {
      id: number
      roleNames: string[]
    }) => {
      return await userApi.syncRoles(id, roleNames)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-user", variables.id] })
    },
  })
}

export function useAssignUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, roleName }: { id: number; roleName: string }) => {
      return await userApi.assignRole(id, roleName)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-user", variables.id] })
    },
  })
}

export function useRemoveUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, roleName }: { id: number; roleName: string }) => {
      return await userApi.removeRole(id, roleName)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-user", variables.id] })
    },
  })
}
export function useBulkInviteUsers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      return await userApi.bulkInvite(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}
