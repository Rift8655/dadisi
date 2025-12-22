import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import RenewalsPage from "@/app/admin/subscriptions/renewals/page"
import { useAdmin } from "@/store/admin"
import Swal from "sweetalert2"

// Mock the shell to avoid complexity
vi.mock("@/components/admin-dashboard-shell", () => ({
  AdminDashboardShell: ({ children, title }: { children?: React.ReactNode; title?: string }) => (
    <div data-testid="shell">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

// Mock SweetAlert
vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
  },
}))

describe("RenewalsPage", () => {
  const fetchRenewalJobsSpy = vi.fn()
  const retryRenewalJobSpy = vi.fn()
  const cancelRenewalJobSpy = vi.fn()

  beforeEach(() => {
    // Reset store state
    useAdmin.setState({
      renewalJobs: [],
      renewalJobsLoading: false,
      fetchRenewalJobs: fetchRenewalJobsSpy,
      retryRenewalJob: retryRenewalJobSpy,
      cancelRenewalJob: cancelRenewalJobSpy,
    })
    vi.clearAllMocks()
  })

  it("fetches jobs on mount", async () => {
    render(<RenewalsPage />)
    await waitFor(() => {
      expect(fetchRenewalJobsSpy).toHaveBeenCalled()
    })
  })

  it("displays loading state", () => {
    useAdmin.setState({ renewalJobsLoading: true })
    render(<RenewalsPage />)
    expect(screen.getByText("Loading renewals...")).toBeTruthy()
  })

  it("displays renewal jobs", () => {
    const jobs = [
      {
        id: 1,
        subscription_id: 101,
        user_id: 50,
        user: { id: 50, name: "Alice", email: "alice@example.com" },
        plan_name: "Premium",
        status: "failed" as const,
        attempts: 2,
        last_attempt_at: "2023-01-01T10:00:00Z",
        next_attempt_at: null,
        error_message: "Card failed",
        created_at: "",
        updated_at: "",
      }
    ]
    useAdmin.setState({ renewalJobs: jobs })

    render(<RenewalsPage />)

    expect(screen.getByText("Alice")).toBeTruthy()
    expect(screen.getByText("Premium")).toBeTruthy()
    expect(screen.getByText("Card failed")).toBeTruthy()
  })

  it("calls retry action on button click", async () => {
    const jobs = [
      { id: 1, status: "failed" as const, attempts: 1 } as any
    ]
    useAdmin.setState({ renewalJobs: jobs })

    render(<RenewalsPage />)

    // Find retry button (it says 'Retry')
    const retryBtn = screen.getByText("Retry")
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(retryRenewalJobSpy).toHaveBeenCalledWith(1)
      expect(Swal.fire).toHaveBeenCalledWith("Retried", expect.any(String), "success")
    })
  })
})
