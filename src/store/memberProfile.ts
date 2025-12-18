import { create } from "zustand"

import type { MemberProfile, County } from "@/types/index"
import { memberProfileApi } from "@/lib/api"
import { queryClient } from "@/lib/queryClient"
import { MemberProfileSchema } from "@/schemas/memberProfile"

interface MemberProfileState {
  member: MemberProfile | null
  loading: boolean
  counties: County[]
  countiesLoading: boolean
  error: string | null
  loadMemberProfile: () => Promise<void>
  fetchCounties: () => Promise<void>
  updateMemberProfile: (id: number, data: Partial<MemberProfile>) => Promise<void>
  setMemberProfile: (m: MemberProfile | null) => void
  clear: () => void
}

export const useMemberProfile = create<MemberProfileState>((set) => ({
  member: null,
  loading: false,
  counties: [],
  countiesLoading: false,
  error: null,
  loadMemberProfile: async () => {
    set({ loading: true, error: null })
    try {

      const res = await memberProfileApi.getMe()
      // Cast to MemberProfile to suppress default/optional mismatch
      set({ member: (res as unknown as MemberProfile) || null, loading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? "Failed to load member profile")
      set({
        error: message || "Failed to load member profile",
        loading: false,
      })
    }
  },
  fetchCounties: async () => {
    set({ countiesLoading: true })
    try {
      const res = await memberProfileApi.getCounties()
      set({ counties: res || [], countiesLoading: false })
    } catch (_err: unknown) {
      set({ counties: [], countiesLoading: false })
    }
  },
  updateMemberProfile: async (id, data) => {
    set({ loading: true })
    try {
      // validate partial payload against schema (partial allowed)
      const valid = MemberProfileSchema.partial().parse(data)
      const res = await memberProfileApi.update(id, valid)
      const member = (res as unknown as MemberProfile) || null
      set({ member, loading: false })
      try {
        // keep React Query cache in sync
        queryClient.setQueryData(["memberProfile"], member)
      } catch (e) {
        // ignore if queryClient not initialized
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? "Failed to update profile")
      set({ error: message || "Failed to update profile", loading: false })
      throw err
    }
  },
  setMemberProfile: (m) => set({ member: m }),
  clear: () => set({ member: null, error: null, loading: false }),
}))

export default useMemberProfile
