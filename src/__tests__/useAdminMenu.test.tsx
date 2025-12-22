import { renderHook, waitFor } from "@testing-library/react"
import { useAdminMenu } from "@/hooks/useAdminMenu"
import { useAdmin } from "@/store/admin"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { LayoutDashboard } from "lucide-react"

describe("useAdminMenu hook", () => {
  beforeEach(() => {
    useAdmin.setState({
      menu: [],
      menuLoading: false,
      fetchMenu: vi.fn().mockResolvedValue(undefined),
    })
    vi.clearAllMocks()
  })

  it("calls fetchMenu on mount", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(undefined)
    useAdmin.setState({ fetchMenu: fetchSpy })

    renderHook(() => useAdminMenu())

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled()
    })
  })

  it("transforms raw menu items to AdminMenuItem with icons", async () => {
    useAdmin.setState({
      menu: [
        { key: "overview", href: "/admin", label: "Overview" },
        { key: "unknown_key", href: "/admin/unknown", label: "Unknown" },
      ],
    })

    const { result } = renderHook(() => useAdminMenu())

    // It appends hardcoded items in the hook now (Phase 4 change)
    // So distinct from raw menu
    const overviewItem = result.current.menu.find((m) => m.key === "overview")
    expect(overviewItem).toBeDefined()
    expect(overviewItem?.icon).toBeDefined()
    
    // Check for default icon usage
    const unknownItem = result.current.menu.find((m) => m.key === "unknown_key")
    expect(unknownItem?.icon).toEqual(LayoutDashboard)
  })

  it("includes locally added items (renewals, etc)", () => {
    const { result } = renderHook(() => useAdminMenu())
    
    const renewals = result.current.menu.find(m => m.key === 'renewals')
    expect(renewals).toBeDefined()
    expect(renewals?.href).toBe('/admin/subscriptions/renewals')
  })
})
