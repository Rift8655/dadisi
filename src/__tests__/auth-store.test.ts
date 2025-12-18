import { beforeEach, describe, it, expect, vi } from "vitest"
import { useAuth } from "@/store/auth"

vi.mock("@/lib/api", () => {
  return {
    authApi: {
      login: vi.fn(),
      getUser: vi.fn(),
      logout: vi.fn(),
    },
    memberProfileApi: {
      getMe: vi.fn(),
    },
  }
})

describe("auth store actions", () => {
  beforeEach(() => {
    // reset persisted state in-memory
    useAuth.setState({ token: null, user: null, isLoading: false, error: null })
    vi.clearAllMocks()
  })

  it("login sets token and user", async () => {
    const api = await import("@/lib/api")
    ;(api.authApi.login as any).mockResolvedValue({
      access_token: "tok",
      user: { id: 1, name: "Test", email: "test@example.com", email_verified_at: null },
    })

    await useAuth.getState().login({ email: "test@example.com", password: "pw" })

    expect(useAuth.getState().token).toBe("tok")
    expect(useAuth.getState().user?.email).toBe("test@example.com")
  })

  it("logout clears token and user even if API fails", async () => {
    const api = await import("@/lib/api")
    ;(api.authApi.logout as any).mockRejectedValue(new Error("network"))

    await useAuth.getState().logout()

    expect(useAuth.getState().token).toBeNull()
    expect(useAuth.getState().user).toBeNull()
  })
})
