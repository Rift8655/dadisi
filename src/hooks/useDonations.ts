import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { donationsApi } from "@/lib/api"
import { DonationSchema, CreateDonationPayload, Donation } from "@/schemas/donation"
import { z } from "zod"

export function useDonations(params?: { page?: number; search?: string }) {
  return useQuery({
    queryKey: ["donations", params],
    queryFn: async () => {
      const res = await donationsApi.list(params as any)
      const raw = res as unknown
      const list = (raw as { data?: unknown }).data ?? raw

      return z.array(DonationSchema).parse(list)
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useDonation(id: number) {
  return useQuery({
    queryKey: ["donation", id],
    queryFn: async () => {
      const res = await donationsApi.get(id)
      const data = (res as any).data ?? res
      return DonationSchema.parse(data)
    },
    enabled: !!id,
  })
}

export function useCreateDonation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateDonationPayload) => {
      return donationsApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] })
    },
  })
}
