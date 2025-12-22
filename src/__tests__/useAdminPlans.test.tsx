import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { vi } from "vitest"

import { useCreatePlan, useUpdatePlan, useDeletePlan } from "@/hooks/useAdminPlans"
import { plansApi } from "@/lib/api"
import * as qc from "@/lib/queryClient"

vi.mock("@/lib/api", () => ({
  plansApi: {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient()
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

function TestComponent() {
  const create = useCreatePlan()
  const update = useUpdatePlan()
  const del = useDeletePlan()

  return (
    <div>
      <button onClick={() => create.mutateAsync({ name: "T", monthly_price_kes: 100, active: true })}>create</button>
      <button onClick={() => update.mutateAsync({ id: 1, payload: { name: "U" } })}>update</button>
      <button onClick={() => del.mutateAsync(2)}>delete</button>
    </div>
  )
}

describe("useAdminPlans hooks", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls plansApi.create and invalidates plans", async () => {
    ;(plansApi.create as any).mockResolvedValue({ ok: true })
    const spy = vi.spyOn(qc, "invalidatePlans")

    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    )

    fireEvent.click(screen.getByText("create"))
    await waitFor(() => expect(plansApi.create).toHaveBeenCalled())
    expect(spy).toHaveBeenCalled()
  })

  it("calls plansApi.update and invalidates plans", async () => {
    ;(plansApi.update as any).mockResolvedValue({ ok: true })
    const spy = vi.spyOn(qc, "invalidatePlans")

    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    )

    fireEvent.click(screen.getByText("update"))
    await waitFor(() => expect(plansApi.update).toHaveBeenCalled())
    expect(spy).toHaveBeenCalled()
  })

  it("calls plansApi.remove and invalidates plans", async () => {
    ;(plansApi.remove as any).mockResolvedValue({ ok: true })
    const spy = vi.spyOn(qc, "invalidatePlans")

    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    )

    fireEvent.click(screen.getByText("delete"))
    await waitFor(() => expect(plansApi.remove).toHaveBeenCalled())
    expect(spy).toHaveBeenCalled()
  })
})
