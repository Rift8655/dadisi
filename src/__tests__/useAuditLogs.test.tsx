import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { vi, describe, it, expect, beforeEach } from "vitest"

import { useAuditLogs, useUserAudit } from "@/hooks/useAuditLogs"
import { adminApi } from "@/lib/api-admin"

vi.mock("@/lib/api-admin", () => ({
  adminApi: {
    auditLogs: {
      list: vi.fn(),
    },
  },
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient()
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

function ListComp() {
  const { data: items = [], isLoading } = useAuditLogs()
  if (isLoading) return <div>loading</div>
  return (
    <div>
      {items.map((i) => (
        <div key={i.id}>{i.action}</div>
      ))}
    </div>
  )
}

function UserComp({ id }: { id: number }) {
  const { data: items = [], isLoading } = useUserAudit(id)
  if (isLoading) return <div>loading</div>
  return (
    <div>
      {items.map((i) => (
        <div key={i.id}>{i.model}</div>
      ))}
    </div>
  )
}

describe("useAuditLogs hooks", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls adminApi.auditLogs.list and returns logs", async () => {
    ;(adminApi.auditLogs.list as any).mockResolvedValue([ { id: 1, user_id: 1, user: { id: 1, name: "Admin", username: "admin", email: "a@e" }, model: "User", model_id: 2, action: "updated", changes: {}, created_at: new Date().toISOString() } ])

    render(
      <Wrapper>
        <ListComp />
      </Wrapper>
    )

    await waitFor(() => expect(adminApi.auditLogs.list).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText("updated")).toBeTruthy())
  })

  it("calls adminApi.auditLogs.list with user_id and returns user audit logs", async () => {
    ;(adminApi.auditLogs.list as any).mockResolvedValue([ { id: 2, user_id: 3, user: { id: 3, name: "User", username: "u", email: "u@e" }, model: "Post", model_id: 5, action: "created", changes: {}, created_at: new Date().toISOString() } ])

    render(
      <Wrapper>
        <UserComp id={3} />
      </Wrapper>
    )

    await waitFor(() => expect(adminApi.auditLogs.list).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText("Post")).toBeTruthy())
  })
})
