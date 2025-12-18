import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { vi } from "vitest"

import AdminPlansPage from "@/app/admin/plans/page"
import { plansApi } from "@/lib/api"

vi.mock("@/lib/api", () => ({
  plansApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient()
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe("Admin plans page", () => {
  beforeEach(() => vi.clearAllMocks())

  it("renders plans list from usePlans", async () => {
    ;(plansApi.getAll as any).mockResolvedValue({ data: [ { id: 1, name: 'Basic', price: 0, active: true }, { id: 2, name: 'Pro', price: 500, active: true } ] })

    render(
      <Wrapper>
        <AdminPlansPage />
      </Wrapper>
    )

    await waitFor(() => screen.getByText(/Basic/))
    expect(screen.getByText(/Basic/)).toBeTruthy()
    expect(screen.getByText(/Pro/)).toBeTruthy()
  })

  it("triggers update and delete flows", async () => {
    ;(plansApi.getAll as any).mockResolvedValue({ data: [ { id: 1, name: 'Basic', price: 0, active: true } ] })
    ;(plansApi.update as any).mockResolvedValue({ ok: true })
    ;(plansApi.remove as any).mockResolvedValue({ ok: true })

    // stub prompt and confirm
    vi.stubGlobal("prompt", () => "NewName")
    vi.stubGlobal("confirm", () => true)

    render(
      <Wrapper>
        <AdminPlansPage />
      </Wrapper>
    )

    await waitFor(() => screen.getByText(/Basic/))
    fireEvent.click(screen.getByText("Edit"))
    await waitFor(() => expect(plansApi.update).toHaveBeenCalled())

    fireEvent.click(screen.getByText("Delete"))
    await waitFor(() => expect(plansApi.remove).toHaveBeenCalled())
  })
})
