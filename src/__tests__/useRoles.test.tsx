import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { vi, describe, it, expect, beforeEach } from "vitest"

import { useRoles, useRole, useCreateRole, useUpdateRole, useDeleteRole, usePermissions, useCreatePermission } from "@/hooks/useRoles"
import { roleApi, permissionApi } from "@/lib/api-admin"

vi.mock("@/lib/api-admin", () => ({
  roleApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  permissionApi: {
    list: vi.fn(),
    create: vi.fn(),
  },
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient()
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

function ListComp() {
  const { data: items = [], isLoading } = useRoles()
  if (isLoading) return <div>loading</div>
  return (
    <div>
      {items.map((r) => (
        <div key={r.id}>{r.name}</div>
      ))}
    </div>
  )
}

function SingleComp({ id }: { id: number }) {
  const { data: item, isLoading } = useRole(id)
  if (isLoading) return <div>loading</div>
  if (!item) return <div>no item</div>
  return <div>{item.name}</div>
}

describe("useRoles hooks", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls roleApi.list and returns roles", async () => {
    ;(roleApi.list as any).mockResolvedValue([ { id: 1, name: "admin", guard_name: "web", permissions: [] } ])

    render(
      <Wrapper>
        <ListComp />
      </Wrapper>
    )

    await waitFor(() => expect(roleApi.list).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText("admin")).toBeTruthy())
  })

  it("calls roleApi.get and returns single role", async () => {
    ;(roleApi.get as any).mockResolvedValue({ id: 2, name: "editor", guard_name: "web", permissions: [] })

    render(
      <Wrapper>
        <SingleComp id={2} />
      </Wrapper>
    )

    await waitFor(() => expect(roleApi.get).toHaveBeenCalledWith(2))
    await waitFor(() => expect(screen.getByText("editor")).toBeTruthy())
  })

  it("creates a new role via mutation", async () => {
    ;(roleApi.create as any).mockResolvedValue({ data: { id: 99, name: "newrole", guard_name: "web", permissions: [] } })

    function Mut() {
      const m = useCreateRole()
      React.useEffect(() => {
        m.mutateAsync({ name: "newrole" })
      }, [])
      return <div>mut</div>
    }

    render(
      <Wrapper>
        <Mut />
      </Wrapper>
    )

    await waitFor(() => expect(roleApi.create).toHaveBeenCalled())
  })

  it("updates an existing role via mutation", async () => {
    ;(roleApi.update as any).mockResolvedValue({ data: { id: 3, name: "updaterole", guard_name: "web", permissions: [] } })

    function Mut() {
      const m = useUpdateRole()
      React.useEffect(() => {
        m.mutateAsync({ id: 3, payload: { name: "updaterole" } })
      }, [])
      return <div>mut</div>
    }

    render(
      <Wrapper>
        <Mut />
      </Wrapper>
    )

    await waitFor(() => expect(roleApi.update).toHaveBeenCalledWith(3, { name: "updaterole" }))
  })

  it("deletes a role via mutation", async () => {
    ;(roleApi.delete as any).mockResolvedValue({})

    function Mut() {
      const m = useDeleteRole()
      React.useEffect(() => {
        m.mutateAsync(5)
      }, [])
      return <div>mut</div>
    }

    render(
      <Wrapper>
        <Mut />
      </Wrapper>
    )

    await waitFor(() => expect(roleApi.delete).toHaveBeenCalledWith(5))
  })

  it("lists permissions and creates a permission", async () => {
    ;(permissionApi.list as any).mockResolvedValue([ { id: 1, name: "manage_users" } ])
    ;(permissionApi.create as any).mockResolvedValue({ data: { id: 42, name: "new_perm" } })

    function PermComp() {
      const { data: perms } = usePermissions()
      const m = useCreatePermission()
      React.useEffect(() => {
        m.mutateAsync({ name: "new_perm" })
      }, [])
      return <div>{perms?.[0]?.name}</div>
    }

    render(
      <Wrapper>
        <PermComp />
      </Wrapper>
    )

    await waitFor(() => expect(permissionApi.list).toHaveBeenCalled())
    await waitFor(() => expect(permissionApi.create).toHaveBeenCalled())
  })
})
