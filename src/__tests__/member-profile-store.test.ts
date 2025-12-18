import { beforeEach, describe, it, expect, vi } from "vitest"
import { useMemberProfile } from "@/store/memberProfile"

vi.mock("@/lib/api", () => ({
  memberProfileApi: {
    getMe: vi.fn(),
    getCounties: vi.fn(),
    update: vi.fn(),
  },
}))

describe("useMemberProfile store", () => {
  beforeEach(() => {
    useMemberProfile.setState({ member: null, loading: false, counties: [], countiesLoading: false, error: null })
    vi.clearAllMocks()
  })

  it("loadMemberProfile sets member", async () => {
    const api = await import("@/lib/api")
    ;(api.memberProfileApi.getMe as any).mockResolvedValue({ id: 1, user_id: 1, first_name: "A", last_name: "B", phone_number: null, date_of_birth: null, gender: null, county_id: null, bio: null, avatar_url: null, created_at: "", updated_at: "" })

    await useMemberProfile.getState().loadMemberProfile()

    expect(useMemberProfile.getState().member).not.toBeNull()
    expect(useMemberProfile.getState().loading).toBe(false)
  })

  it("fetchCounties sets counties", async () => {
    const api = await import("@/lib/api")
    ;(api.memberProfileApi.getCounties as any).mockResolvedValue([ { id: 1, name: "County" } ])

    await useMemberProfile.getState().fetchCounties()

    expect(useMemberProfile.getState().counties.length).toBe(1)
    expect(useMemberProfile.getState().countiesLoading).toBe(false)
  })

  it("updateMemberProfile updates member or throws on error", async () => {
    const api = await import("@/lib/api")
    ;(api.memberProfileApi.update as any).mockResolvedValue({ id: 1, user_id: 1, first_name: "X", last_name: "Y", phone_number: null, date_of_birth: null, gender: null, county_id: null, bio: null, avatar_url: null, created_at: "", updated_at: "" })

    await useMemberProfile.getState().updateMemberProfile(1, { first_name: "X" })

    expect(useMemberProfile.getState().member?.first_name).toBe("X")

    ;(api.memberProfileApi.update as any).mockRejectedValue(new Error("fail"))
    await expect(useMemberProfile.getState().updateMemberProfile(1, { first_name: "Z" })).rejects.toBeDefined()
  })
})

export {}
