import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { groupsApi } from "@/lib/api"
import { GroupSchema, GroupsSchema, type Group } from "@/schemas/forum"

// Caching Strategy:
// - Groups: Tier 2 (Stable Metadata) - 1 hour staleTime (groups rarely change)
// - Group Members: Tier 3 (Standard) - 5 minutes staleTime

const ONE_HOUR = 1000 * 60 * 60
const FIVE_MINUTES = 1000 * 60 * 5

/**
 * Fetch all groups (county-based networking hubs)
 * Tier 2: Stable metadata - 1 hour staleTime
 */
export function useGroups(params: { county_id?: number; search?: string; per_page?: number } = {}) {
  return useQuery({
    queryKey: ["groups", params],
    queryFn: async () => {
      const response = await groupsApi.list(params)
      // Validate with Zod
      const validated = GroupsSchema.safeParse(response.data)
      if (!validated.success) {
        console.error("Groups validation failed:", validated.error.format())
        return { data: response.data as Group[], meta: response.meta }
      }
      return { data: validated.data, meta: response.meta }
    },
    staleTime: ONE_HOUR,
  })
}

/**
 * Fetch a single group by slug with members and discussions
 * Tier 3: Standard - 5 minutes staleTime (includes dynamic member data)
 */
export function useGroup(slug: string) {
  return useQuery({
    queryKey: ["group", slug],
    queryFn: async () => {
      const response = await groupsApi.show(slug)
      return response.data
    },
    enabled: !!slug,
    staleTime: FIVE_MINUTES,
  })
}

/**
 * Fetch group members
 * Tier 3: Standard - 5 minutes staleTime
 */
export function useGroupMembers(slug: string, params?: { per_page?: number }) {
  return useQuery({
    queryKey: ["group-members", slug, params],
    queryFn: () => groupsApi.members(slug, params),
    enabled: !!slug,
    staleTime: FIVE_MINUTES,
  })
}

/**
 * Join a group mutation
 */
export function useJoinGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => groupsApi.join(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ["group", slug] })
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

/**
 * Leave a group mutation
 */
export function useLeaveGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => groupsApi.leave(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ["group", slug] })
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

// Re-export type
export type { Group }
