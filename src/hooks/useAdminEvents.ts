import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { eventsAdminApi, type AdminEventFilters, type AdminEventStats } from "@/lib/api-admin"
import type { Event } from "@/types"

// Re-export types for consumers
export type { AdminEventFilters, AdminEventStats }

// Query key factory for admin events
export const adminEventKeys = {
  all: ["admin-events"] as const,
  lists: () => [...adminEventKeys.all, "list"] as const,
  list: (params: AdminEventFilters) => [...adminEventKeys.lists(), params] as const,
  details: () => [...adminEventKeys.all, "detail"] as const,
  detail: (id: number) => [...adminEventKeys.details(), id] as const,
  registrations: (id: number, params: any) => [...adminEventKeys.detail(id), "registrations", params] as const,
  stats: () => [...adminEventKeys.all, "stats"] as const,
}

// Fetch paginated admin events list
export function useAdminEvents(params: AdminEventFilters = {}) {
  return useQuery({
    queryKey: adminEventKeys.list(params),
    queryFn: async () => {
      const response = await eventsAdminApi.list(params)
      return {
        events: response.data as Event[],
        pagination: response.meta?.pagination ?? {
          page: 1,
          per_page: params.per_page ?? 20,
          total: response.data?.length ?? 0,
          last_page: 1,
        },
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes
  })
}

// Fetch single admin event
export function useAdminEvent(id: number | null) {
  return useQuery({
    queryKey: id ? adminEventKeys.detail(id) : ["admin-events", "detail", 0],
    queryFn: async () => {
      if (!id) return null
      const response = await eventsAdminApi.get(id)
      return response.data as Event
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

// Fetch admin event registrations
export function useAdminEventRegistrations(id: number | null, params: { status?: string; waitlist?: boolean; page?: number; per_page?: number } = {}) {
  return useQuery({
    queryKey: id ? adminEventKeys.registrations(id, params) : ["admin-events", "registrations", 0, params],
    queryFn: async () => {
      if (!id) return null
      const response = await eventsAdminApi.registrations(id, params)
      return {
        registrations: response.data,
        pagination: response.meta?.pagination || response, // Handle both wrapped or raw Laravel pagination
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

// Fetch admin event statistics
export function useAdminEventStats() {
  return useQuery<AdminEventStats>({
    queryKey: adminEventKeys.stats(),
    queryFn: async () => {
      const response = await eventsAdminApi.stats()
      return response
    },
    staleTime: 1000 * 60 * 1, // 1 minute
  })
}

// Cache invalidation helpers
export function useInvalidateAdminEvents() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: adminEventKeys.all }),
    invalidateLists: () => queryClient.invalidateQueries({ queryKey: adminEventKeys.lists() }),
    invalidateStats: () => queryClient.invalidateQueries({ queryKey: adminEventKeys.stats() }),
    invalidateDetail: (id: number) => queryClient.invalidateQueries({ queryKey: adminEventKeys.detail(id) }),
    invalidateRegistrations: (id: number) => queryClient.invalidateQueries({ queryKey: [...adminEventKeys.detail(id), "registrations"] }),
  }
}

// Admin event mutations
export function useAdminEventMutations() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateAdminEvents()

  const approveMutation = useMutation({
    mutationFn: (id: number) => eventsAdminApi.approve(id),
    onSuccess: () => {
      invalidate.invalidateAll()
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      eventsAdminApi.reject(id, { reason }),
    onSuccess: () => {
      invalidate.invalidateAll()
    },
  })

  const publishMutation = useMutation({
    mutationFn: (id: number) => eventsAdminApi.publish(id),
    onSuccess: () => {
      invalidate.invalidateAll()
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => eventsAdminApi.cancel(id),
    onSuccess: () => {
      invalidate.invalidateAll()
    },
  })

  const suspendMutation = useMutation({
    mutationFn: (id: number) => eventsAdminApi.suspend(id),
    onSuccess: () => {
      invalidate.invalidateAll()
    },
  })

  const featureMutation = useMutation({
    mutationFn: ({ id, until }: { id: number; until?: string }) =>
      eventsAdminApi.feature(id, { until }),
    onSuccess: () => {
      invalidate.invalidateAll()
    },
  })

  const unfeatureMutation = useMutation({
    mutationFn: (id: number) => eventsAdminApi.unfeature(id),
    onSuccess: () => {
      invalidate.invalidateAll()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => eventsAdminApi.delete(id),
    onSuccess: () => {
      invalidate.invalidateAll()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      eventsAdminApi.update(id, data),
    onSuccess: () => {
      invalidate.invalidateAll()
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      eventsAdminApi.create(data),
    onSuccess: () => {
      invalidate.invalidateAll()
    },
  })

  return {
    approve: approveMutation,
    reject: rejectMutation,
    publish: publishMutation,
    cancel: cancelMutation,
    suspend: suspendMutation,
    feature: featureMutation,
    unfeature: unfeatureMutation,
    delete: deleteMutation,
    update: updateMutation,
    create: createMutation,
  }
}
