import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { vi, describe, it, expect, beforeEach } from "vitest"

import { useRetentionSettings, useRetentionSetting, useUpdateRetention } from "@/hooks/useRetention"
import { retentionApi } from "@/lib/api-admin"

vi.mock("@/lib/api-admin", () => ({
  retentionApi: {
    list: vi.fn(),
    getOne: vi.fn(),
    update: vi.fn(),
  },
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient()
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

function ListComponent() {
  const { data: items = [], isLoading } = useRetentionSettings()
  if (isLoading) return <div>loading</div>
  return (
    <div>
      {items.map((i) => (
        <div key={i.id}>{i.data_type}</div>
      ))}
    </div>
  )
}

function SingleComponent({ id }: { id: number }) {
  const { data: item, isLoading } = useRetentionSetting(id)
  if (isLoading) return <div>loading</div>
  if (!item) return <div>no item</div>
  return <div>{item.data_type}</div>
}

describe("useRetention hooks", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls retentionApi.list and returns items", async () => {
    ;(retentionApi.list as any).mockResolvedValue([ { id: 1, data_type: "member_profiles", retention_days: 3650, auto_delete: false, description: null, updated_by: null, updated_by_user: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } ])

    render(
      <Wrapper>
        <ListComponent />
      </Wrapper>
    )

    await waitFor(() => expect(retentionApi.list).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText("member_profiles")).toBeTruthy())
  })

  it("calls retentionApi.getOne and returns single item", async () => {
    ;(retentionApi.getOne as any).mockResolvedValue({ id: 2, data_type: "posts", retention_days: 365, auto_delete: true, description: "Posts", updated_by: null, updated_by_user: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })

    render(
      <Wrapper>
        <SingleComponent id={2} />
      </Wrapper>
    )

    await waitFor(() => expect(retentionApi.getOne).toHaveBeenCalledWith(2))
    await waitFor(() => expect(screen.getByText("posts")).toBeTruthy())
  })

  it("calls retentionApi.update via mutation", async () => {
    ;(retentionApi.update as any).mockResolvedValue({ id: 3, data_type: "donations", retention_days: 180, auto_delete: false, description: null, updated_by: null, updated_by_user: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })

    function MutateComp() {
      const m = useUpdateRetention()
      React.useEffect(() => {
        m.mutateAsync({ id: 3, payload: { retention_days: 180 } })
      }, [])
      return <div>mutate</div>
    }

    render(
      <Wrapper>
        <MutateComp />
      </Wrapper>
    )

    await waitFor(() => expect(retentionApi.update).toHaveBeenCalledWith(3, { retention_days: 180 }))
  })
})
