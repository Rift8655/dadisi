"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type {
  CreateLabBookingRequest,
  LabAvailabilityResponse,
  LabBooking,
  LabQuotaStatus,
  LabSpace,
} from "@/types/lab"
import { labBookingsApi, labSpacesApi } from "@/lib/api"

// ============================================
// Lab Spaces Hooks (Public)
// ============================================

/**
 * Fetch all active lab spaces
 */
export function useLabSpaces(params?: {
  type?: string
  search?: string
  county?: string
}) {
  return useQuery({
    queryKey: ["lab-spaces", params],
    queryFn: async () => {
      const res = await labSpacesApi.list(params)
      return res.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch a single lab space by slug
 */
export function useLabSpace(slug: string) {
  return useQuery({
    queryKey: ["lab-space", slug],
    queryFn: async () => {
      const res = await labSpacesApi.get(slug)
      return res.data
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch lab space availability calendar
 */
export function useLabSpaceAvailability(
  slug: string,
  params?: { start?: string; end?: string }
) {
  return useQuery({
    queryKey: ["lab-space-availability", slug, params],
    queryFn: async () => {
      const res = await labSpacesApi.availability(slug, params)
      return res.data
    },
    enabled: !!slug,
    staleTime: 60 * 1000, // 1 minute - availability changes frequently
  })
}

// ============================================
// Lab Quota Hook
// ============================================

/**
 * Fetch user's lab hours quota status
 * Only runs when enabled (should be set to isAuthenticated)
 */
export function useLabQuota(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true

  return useQuery({
    queryKey: ["lab-quota"],
    queryFn: async () => {
      const res = await labBookingsApi.getQuota()
      return res.data
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// ============================================
// Lab Bookings Hooks (Authenticated)
// ============================================

/**
 * Fetch user's lab bookings
 */
export function useLabBookings(params?: {
  status?: string
  upcoming?: boolean
}) {
  return useQuery({
    queryKey: ["lab-bookings", params],
    queryFn: async () => {
      const res = await labBookingsApi.list(params)
      return res.data
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Fetch a single booking by ID
 */
export function useLabBooking(id: number | null) {
  return useQuery({
    queryKey: ["lab-booking", id],
    queryFn: async () => {
      if (!id) return null
      const res = await labBookingsApi.get(id)
      return res.data
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  })
}

/**
 * Create a new lab booking
 */
export function useCreateLabBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLabBookingRequest) => labBookingsApi.create(data),
    onSuccess: (response) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["lab-bookings"] })
      queryClient.invalidateQueries({ queryKey: ["lab-quota"] })
      queryClient.invalidateQueries({ queryKey: ["lab-space-availability"] })

      toast.success(response.message || "Booking created successfully!")
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to create booking"
      toast.error(message)
    },
  })
}

/**
 * Cancel a lab booking
 */
export function useCancelLabBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => labBookingsApi.cancel(id),
    onSuccess: (response) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["lab-bookings"] })
      queryClient.invalidateQueries({ queryKey: ["lab-quota"] })
      queryClient.invalidateQueries({ queryKey: ["lab-space-availability"] })

      toast.success(response.message || "Booking cancelled successfully!")
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to cancel booking"
      toast.error(message)
    },
  })
}

// ============================================
// Utility Types & Helpers
// ============================================

export type LabSpaceTypeOption = {
  value: string
  label: string
  icon: string
}

export const LAB_SPACE_TYPES: LabSpaceTypeOption[] = [
  { value: "wet_lab", label: "Wet Lab", icon: "🧪" },
  { value: "dry_lab", label: "Dry Lab", icon: "💻" },
  { value: "greenhouse", label: "Greenhouse", icon: "🌱" },
  { value: "mobile_lab", label: "Mobile Lab", icon: "🚐" },
  { value: "makerspace", label: "Makerspace", icon: "🛠️" },
  { value: "workshop", label: "Workshop", icon: "⚒️" },
  { value: "studio", label: "Studio", icon: "🎨" },
  { value: "other", label: "Other", icon: "🏢" },
]

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  approved: "bg-green-500/20 text-green-700 border-green-500/30",
  rejected: "bg-red-500/20 text-red-700 border-red-500/30",
  cancelled: "bg-gray-500/20 text-gray-700 border-gray-500/30",
  completed: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  no_show: "bg-orange-500/20 text-orange-700 border-orange-500/30",
}

export const SLOT_TYPE_DURATIONS: Record<
  string,
  { hours: number; label: string }
> = {
  hourly: { hours: 1, label: "Hourly" },
  half_day: { hours: 4, label: "Half Day (4 hours)" },
  full_day: { hours: 8, label: "Full Day (8 hours)" },
}

/**
 * Format quota display string
 */
export function formatQuotaStatus(quota: LabQuotaStatus): string {
  if (!quota.has_access) {
    return "No lab access"
  }
  if (quota.unlimited) {
    return `Unlimited (Used: ${quota.used}h)`
  }
  return `${quota.remaining}h remaining of ${quota.limit}h`
}

/**
 * Check if user can book based on quota
 */
export function canBookWithQuota(
  quota: LabQuotaStatus,
  requestedHours: number
): boolean {
  if (!quota.has_access) return false
  if (quota.unlimited) return true
  return (quota.remaining || 0) >= requestedHours
}
