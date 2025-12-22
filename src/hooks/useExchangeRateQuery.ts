import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { z } from "zod"

// Schema matches raw ExchangeRate model from backend
const ExchangeRateSchema = z.object({
  id: z.number(),
  from_currency: z.string(),
  to_currency: z.string(),
  rate: z.union([z.string(), z.number()]).transform(v => Number(v)),
  inverse_rate: z.union([z.string(), z.number()]).transform(v => Number(v)),
  cache_minutes: z.number(),
  last_updated: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type ExchangeRateResponse = z.infer<typeof ExchangeRateSchema>

export function useExchangeRateQuery(enabled = true) {
  return useQuery({
    queryKey: ["exchangeRate"],
    queryFn: async () => {
      const res = await api.get("/api/exchange-rates/latest")
      return ExchangeRateSchema.parse(res)
    },
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}
