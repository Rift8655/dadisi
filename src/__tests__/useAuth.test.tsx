import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { vi } from "vitest"

import { useSendResetEmail, useResetPassword } from "@/hooks/useAuth"
import { authApi } from "@/lib/api"

vi.mock("@/lib/api", () => ({
  authApi: {
    sendResetEmail: vi.fn(),
    resetPassword: vi.fn(),
  },
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient()
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

function SendComp() {
  const mutation = useSendResetEmail()
  React.useEffect(() => {
    mutation.mutate({ email: "test@example.com" })
  }, [])
  if (mutation.isPending) return <div>loading</div>
  return <div>done</div>
}

function ResetComp() {
  const mutation = useResetPassword()
  React.useEffect(() => {
    mutation.mutate({ email: "test@example.com", password: "abc", password_confirmation: "abc", token: "token" })
  }, [])
  if (mutation.isPending) return <div>loading</div>
  return <div>done</div>
}

describe("useAuth hooks", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls authApi.sendResetEmail and returns", async () => {
    ;(authApi.sendResetEmail as any).mockResolvedValue({ data: { message: "sent" } })

    render(
      <Wrapper>
        <SendComp />
      </Wrapper>
    )

    await waitFor(() => expect(authApi.sendResetEmail).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText("done")).toBeTruthy())
  })

  it("calls authApi.resetPassword and returns", async () => {
    ;(authApi.resetPassword as any).mockResolvedValue({ data: { message: "ok" } })

    render(
      <Wrapper>
        <ResetComp />
      </Wrapper>
    )

    await waitFor(() => expect(authApi.resetPassword).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText("done")).toBeTruthy())
  })
})
