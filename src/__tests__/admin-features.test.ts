import { describe, it, expect, vi, beforeEach } from "vitest"
import { useAdmin } from "@/store/admin"
import { adminApi, reconciliationApi } from "@/lib/api-admin"

// Mock the admin API
vi.mock("@/lib/api-admin", () => ({
  adminApi: {
    systemSettings: {
      list: vi.fn(),
      update: vi.fn(),
    },
    blog: {
        posts: {
            delete: vi.fn(),
            restore: vi.fn(),
            forceDelete: vi.fn(),
            list: vi.fn()
        }
    }
  },
  reconciliationApi: {
    stats: vi.fn(),
    trigger: vi.fn(),
    export: vi.fn(),
    list: vi.fn(),
  }
}))

describe("Admin Store - New Features", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAdmin.setState({ 
        systemSettings: { environment: 'sandbox', consumer_key: '', consumer_secret: '', callback_url: '', webhook_url: '' },
        reconciliationStats: null,
        posts: []
    })
  })

  describe("System Settings", () => {
    it("fetches and maps system settings correctly", async () => {
      const mockResponse = {
        "pesapal.environment": "live",
        "pesapal.consumer_key": "abc",
      }
      vi.mocked(adminApi.systemSettings.list).mockResolvedValue(mockResponse as any)

      await useAdmin.getState().fetchSystemSettings()

      const state = useAdmin.getState()
      expect(state.systemSettings.environment).toBe("live")
      expect(state.systemSettings.consumer_key).toBe("abc")
    })

    it("saves and maps settings back to payload", async () => {
      useAdmin.setState({
        systemSettings: {
          environment: "live",
          consumer_key: "abc",
          consumer_secret: "secret",
          callback_url: "url",
          webhook_url: "webhook",
        },
      })

      await useAdmin.getState().saveSystemSettings()

      expect(adminApi.systemSettings.update).toHaveBeenCalledWith({
        "pesapal.environment": "live",
        "pesapal.consumer_key": "abc",
        "pesapal.consumer_secret": "secret",
        "pesapal.callback_url": "url",
        "pesapal.webhook_url": "webhook",
      })
    })
  })

  describe("Blog Management", () => {
      it("calls delete post api", async () => {
          await useAdmin.getState().deletePost(1)
          expect(adminApi.blog.posts.delete).toHaveBeenCalledWith(1)
      })

      it("calls restore post api", async () => {
        await useAdmin.getState().restorePost(1)
        expect(adminApi.blog.posts.restore).toHaveBeenCalledWith(1)
     })

     it("calls force delete post api", async () => {
        await useAdmin.getState().forceDeletePost(1)
        expect(adminApi.blog.posts.forceDelete).toHaveBeenCalledWith(1)
     })
  })

  describe("Reconciliation", () => {
      it("fetches stats", async () => {
          const mockStats = { total_runs: 5, total_items: 100 }
          vi.mocked(reconciliationApi.stats).mockResolvedValue(mockStats as any)
          
          await useAdmin.getState().fetchReconciliationStats()

          expect(useAdmin.getState().reconciliationStats).toEqual(mockStats)
      })

      it("triggers reconciliation run", async () => {
          vi.mocked(reconciliationApi.list).mockResolvedValue([] as any)
          await useAdmin.getState().triggerReconciliation("dry_run")
          expect(reconciliationApi.trigger).toHaveBeenCalledWith({ mode: "dry_run" })
      })
  })
})
