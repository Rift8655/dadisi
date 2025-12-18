import { useQuery } from "@tanstack/react-query"
import { memberProfileApi } from "@/lib/api"
import { MemberProfile as MemberProfileType } from "@/types/index"
import { MemberProfileSchema, CountiesArraySchema } from "@/schemas/memberProfile"

export function useMemberProfileQuery(enabled = true) {
  return useQuery<MemberProfileType | null>({
    queryKey: ["memberProfile"],
    queryFn: async () => {
      const data = await memberProfileApi.getMe()
      if (!data) return null
      // We can trust the API layer validation, or double-check with schema if needed. 
      // API layer already ensures it matches MemberProfileSchemaFull basically.
      // But let's keep parsing if it does extra transforms, though redundant.
      // Actually memberProfileApi.getMe returns validated data.
      return data as MemberProfileType
    },
    enabled,
  })
}

export function useCountiesQuery(enabled = true) {
  return useQuery({
    queryKey: ["counties"],
    queryFn: async () => {
      const list = await memberProfileApi.getCounties()
      return list
    },
    enabled,
  })
}
