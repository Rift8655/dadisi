import { useQuery } from "@tanstack/react-query"
import { plansApi } from "@/lib/api"
import { PlansArraySchema } from "@/schemas/plan"

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: plansApi.getAll,
    staleTime: 1000 * 60 * 5
  })
}
