import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { adminApi } from "@/lib/api-admin"

export function useAdminExchangeRates() {
  return useQuery({
    queryKey: ["admin-exchange-rates"],
    queryFn: async () => {
      const data = await adminApi.exchangeRates.list()
      return Array.isArray(data) ? data : (data as any)?.data || []
    },
    staleTime: 1000 * 60 * 60, // Tier 2: Stable metadata - 1 hour
  })
}

export function useAdminExchangeRatesInfo() {
  return useQuery({
    queryKey: ["exchange-rates-info"],
    queryFn: async () => {
      const response = await adminApi.exchangeRates.getInfo()
      // API returns { success: true, data: {...} }, extract the data
      return response?.data || response
    },
    staleTime: 1000 * 60 * 60, // Tier 2: Stable metadata - 1 hour
  })
}

export function useRefreshExchangeRates() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => adminApi.exchangeRates.refresh(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rates-info"] })
      queryClient.invalidateQueries({ queryKey: ["admin-exchange-rates"] })
      queryClient.invalidateQueries({ queryKey: ["exchangeRate"] })
    },
  })
}

export function useUpdateExchangeRates() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rates: Record<string, number>) => {
      return await adminApi.exchangeRates.update({ rates })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rates-info"] })
      queryClient.invalidateQueries({ queryKey: ["admin-exchange-rates"] })
      queryClient.invalidateQueries({ queryKey: ["exchangeRate"] })
    },
  })
}

export function useUpdateManualExchangeRate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (rate: number) => adminApi.exchangeRates.updateManual(rate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rates-info"] })
      queryClient.invalidateQueries({ queryKey: ["admin-exchange-rates"] })
      queryClient.invalidateQueries({ queryKey: ["exchangeRate"] })
    },
  })
}

export function useUpdateExchangeRateCache() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (minutes: number) =>
      adminApi.exchangeRates.updateCache(minutes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rates-info"] })
    },
  })
}
