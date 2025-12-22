import { useQuery, useQueryClient } from "@tanstack/react-query"
import { donationAdminApi } from "@/lib/api-admin"

// Cache keys for admin donations
export const adminDonationKeys = {
  all: ["admin-donations"] as const,
  lists: () => [...adminDonationKeys.all, "list"] as const,
  list: (params: AdminDonationParams) => [...adminDonationKeys.lists(), params] as const,
  details: () => [...adminDonationKeys.all, "detail"] as const,
  detail: (id: number) => [...adminDonationKeys.details(), id] as const,
  stats: () => [...adminDonationKeys.all, "stats"] as const,
}

export interface AdminDonationParams {
  page?: number
  per_page?: number
  status?: string
  campaign_id?: number
  search?: string
  start_date?: string
  end_date?: string
}

export interface AdminDonation {
  id: number
  reference: string
  donor_name: string
  donor_email: string
  amount: number
  currency: string
  status: string
  campaign?: { id: number; title: string; slug: string }
  user?: { id: number; name: string; email: string }
  created_at: string
}

export interface AdminDonationDetail extends AdminDonation {
  donor_phone?: string
  notes?: string
  county?: { id: number; name: string }
}

export interface DonationStats {
  total_donations: number
  total_amount: number
  paid_count: number
  pending_count: number
  failed_count: number
  campaign_donations: number
  general_donations: number
}

/**
 * Hook for fetching paginated admin donations list with caching
 */
export function useAdminDonations(params: AdminDonationParams = {}) {
  return useQuery({
    queryKey: adminDonationKeys.list(params),
    queryFn: async () => {
      const response = await donationAdminApi.list(params)
      return {
        donations: response.data as AdminDonation[],
        pagination: response.pagination,
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes (formerly cacheTime)
  })
}

/**
 * Hook for fetching a single donation detail
 */
export function useAdminDonation(id: number) {
  return useQuery({
    queryKey: adminDonationKeys.detail(id),
    queryFn: async () => {
      const response = await donationAdminApi.get(id)
      return response.data as AdminDonationDetail
    },
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook for fetching donation statistics
 */
export function useAdminDonationStats() {
  return useQuery({
    queryKey: adminDonationKeys.stats(),
    queryFn: async () => {
      const response = await donationAdminApi.stats()
      return response.data as DonationStats
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook to invalidate donation queries (call after mutations)
 */
export function useInvalidateDonations() {
  const queryClient = useQueryClient()
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: adminDonationKeys.all }),
    invalidateLists: () => queryClient.invalidateQueries({ queryKey: adminDonationKeys.lists() }),
    invalidateStats: () => queryClient.invalidateQueries({ queryKey: adminDonationKeys.stats() }),
    invalidateDetail: (id: number) => queryClient.invalidateQueries({ queryKey: adminDonationKeys.detail(id) }),
  }
}
