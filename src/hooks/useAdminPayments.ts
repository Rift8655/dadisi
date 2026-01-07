import { useQuery } from "@tanstack/react-query"

import { financeApi } from "@/lib/api-admin"

export function useAdminPayment(id: number | null) {
  return useQuery({
    queryKey: ["admin-payment", id],
    queryFn: async () => {
      if (!id) return null
      const response = await financeApi.payments.get(id)
      return response.data
    },
    enabled: !!id,
  })
}
