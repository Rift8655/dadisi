import { beforeEach, describe, it, expect, vi } from "vitest"
import { useMembership } from "@/store/membership"

vi.mock("@/lib/api", () => ({
  subscriptionsApi: {
    create: vi.fn(),
  },
}))

describe("useMembership store - createSubscription", () => {
  beforeEach(() => {
    // reset any client-only state
    useMembership.setState({ selectedPlanId: null })
    vi.clearAllMocks()
  })

  it("createSubscription delegates to subscriptionsApi.create and returns data", async () => {
    const api = await import("@/lib/api")
    ;(api.subscriptionsApi.create as any).mockResolvedValue({ message: "ok", next_url: null })

    const res = await useMembership.getState().createSubscription({ plan_id: 1, billing_interval: "monthly" })

    expect((api.subscriptionsApi.create as any).mock.calls.length).toBe(1)
    expect(res).toEqual({ message: "ok", next_url: null })
  })

  it("createSubscription throws when API errors", async () => {
    const api = await import("@/lib/api")
    ;(api.subscriptionsApi.create as any).mockRejectedValue(new Error("fail"))

    await expect(useMembership.getState().createSubscription({ plan_id: 2, billing_interval: "yearly" })).rejects.toThrow("fail")
  })
})

export {}
