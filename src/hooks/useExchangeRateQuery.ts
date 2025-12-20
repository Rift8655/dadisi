import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { z } from "zod"

const ExchangeRateSchema = z.object({
  success: z.boolean(),
  data: z.object({
    rate: z.number(),
    currency: z.string(),
    updated_at: z.string()
  })
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
