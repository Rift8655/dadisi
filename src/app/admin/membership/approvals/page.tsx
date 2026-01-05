"use client"

import { useState } from "react"
import { Filter, Search } from "lucide-react"

import { AdminStudentApprovalRequest } from "@/types/admin"
import { useAdminStudentApprovals } from "@/hooks/useStudentApprovals"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { StudentApprovalDialog } from "@/components/admin/student-approval-dialog"
import { StudentApprovalList } from "@/components/admin/student-approval-list"

export default function StudentApprovalsPage() {
  const [status, setStatus] = useState<string>("pending")
  const [county, setCounty] = useState<string>("")
  const [page, setPage] = useState(1)
  const [selectedRequest, setSelectedRequest] =
    useState<AdminStudentApprovalRequest | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: approvalsData, isLoading } = useAdminStudentApprovals({
    status,
    county: county || undefined,
    page,
    per_page: 15,
  })

  const requests = approvalsData?.data || []
  const pagination = approvalsData?.pagination || {
    total: 0,
    last_page: 1,
    current_page: 1,
  }

  const handleReview = (request: AdminStudentApprovalRequest) => {
    setSelectedRequest(request)
    setDialogOpen(true)
  }

  return (
    <AdminDashboardShell title="Student Approvals">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Student Approval Workflow
          </h1>
          <p className="text-muted-foreground">
            Review and process applications for student plan eligibility.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium">
                    Status
                  </label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value)
                      setPage(1)
                    }}
                  >
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="">All Statuses</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium">
                    Search County
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. Nairobi"
                      className="pl-9"
                      value={county}
                      onChange={(e) => {
                        setCounty(e.target.value)
                        setPage(1)
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Approval Requests</CardTitle>
            <CardDescription>
              {status === "pending"
                ? "Applications awaiting verification."
                : "History of processed student applications."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentApprovalList
              requests={requests}
              isLoading={isLoading}
              onAction={handleReview}
              currentPage={pagination.current_page}
              totalPages={pagination.last_page}
              totalItems={pagination.total}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </div>

      <StudentApprovalDialog
        request={selectedRequest}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </AdminDashboardShell>
  )
}
