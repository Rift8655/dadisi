import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { memberProfileApi } from "@/lib/api"
import { MemberProfile as MemberProfileType } from "@/types/index"
import { MemberProfileSchema } from "@/schemas/memberProfile"

export function useMemberProfileQuery(enabled = true) {
  return useQuery<MemberProfileType | null>({
    queryKey: ["memberProfile"],
    queryFn: async () => {
      const data = await memberProfileApi.getMe()
      if (!data) return null
      return data as MemberProfileType
    },
    enabled,
    staleTime: 1000 * 60 * 5, // Tier 3: Standard - 5 minutes
  })
}

export function useCountiesQuery(enabled = true) {
  return useQuery({
    queryKey: ["counties"],
    queryFn: () => memberProfileApi.getCounties(),
    enabled,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<MemberProfileType> }) => {
      const valid = MemberProfileSchema.partial().parse(data)
      return memberProfileApi.update(id, valid)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["memberProfile"], data)
      queryClient.invalidateQueries({ queryKey: ["memberProfile"] })
    },
  })
}

