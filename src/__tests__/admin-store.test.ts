import { beforeEach, describe, it, expect, vi } from "vitest"
import { useAdmin } from "@/store/admin"

vi.mock("@/lib/api-admin", () => {
  return {
    adminApi: {
      auditLogs: { list: vi.fn() },
      users: { list: vi.fn() },
      roles: { list: vi.fn() },
      retention: { list: vi.fn(), update: vi.fn() },
      getMenu: vi.fn(),
    },
  }
})

describe("useAdmin store actions", () => {
  beforeEach(() => {
    // reset relevant parts of the store
    useAdmin.setState({
      logs: [],
      logsLoading: false,
      logsTotalPages: 1,
      users: [],
      usersLoading: false,
      usersTotalPages: 1,
      roles: [],
      rolesLoading: false,
      menu: [],
      menuLoading: false,
      retentionSettings: [],
      retentionLoading: false,
    })
    vi.clearAllMocks()
  })

  it("fetchRetentionSettings populates retentionSettings", async () => {
    const api = await import("@/lib/api-admin")
    ;(api.adminApi.retention.list as any).mockResolvedValue({ data: [
      {
        id: 1,
        data_type: "users",
        retention_days: 30,
        auto_delete: true,
        description: "",
        updated_by: null,
        created_at: "",
        updated_at: "",
      },
    ] })

    await useAdmin.getState().fetchRetentionSettings()

    expect(useAdmin.getState().retentionSettings.length).toBe(1)
    expect(useAdmin.getState().retentionSettings[0].data_type).toBe("users")
  })

  it("fetchMenu populates menu", async () => {
    const api = await import("@/lib/api-admin")
    ;(api.adminApi.getMenu as any).mockResolvedValue({ data: [ { key: "overview", href: "/admin", label: "Overview" } ] })

    await useAdmin.getState().fetchMenu()

    expect(useAdmin.getState().menu.length).toBe(1)
    expect(useAdmin.getState().menu[0].key).toBe("overview")
  })

  it("loadAuditLogs sets logs and pagination", async () => {
    const api = await import("@/lib/api-admin")
    const log = { id: 1, user_id: 2, model: "User", model_id: 1, action: "update", changes: {}, ip_address: "", created_at: "" }
    ;(api.adminApi.auditLogs.list as any).mockResolvedValue({ data: { data: [log], meta: { last_page: 3 } } })

    await useAdmin.getState().loadAuditLogs()

    expect(useAdmin.getState().logs.length).toBe(1)
    expect(useAdmin.getState().logsTotalPages).toBe(3)
  })

  it("loadUsers and loadRoles populate lists", async () => {
    const api = await import("@/lib/api-admin")
    ;(api.adminApi.users.list as any).mockResolvedValue({ data: { data: [ { id: 5, name: "U", username: "u", email: "u@x", email_verified_at: null, created_at: "", updated_at: "", deleted_at: null, roles: [] } ], meta: { last_page: 1 } } })
    ;(api.adminApi.roles.list as any).mockResolvedValue({ data: { data: [ { id: 2, name: "admin", guard_name: "web", created_at: "", updated_at: "" } ], meta: { last_page: 1 } } })

    await useAdmin.getState().loadUsers()
    await useAdmin.getState().loadRoles()

    expect(useAdmin.getState().users.length).toBe(1)
    expect(useAdmin.getState().roles.length).toBe(1)
  })
})

export {}
