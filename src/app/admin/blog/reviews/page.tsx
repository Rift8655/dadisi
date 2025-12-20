"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/store/auth"
import { Check, X, Search } from "lucide-react"
import Swal from "sweetalert2"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api"
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
import { Unauthorized } from "@/components/unauthorized"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface DeletionRequest {
  id: number
  type: "category" | "tag"
  name: string
  slug: string
  requested_at: string
  requested_by: {
    id: number
    username: string
    email: string
  }
  post_count?: number
}

// Admin API for deletion reviews
const deletionReviewApi = {
  list: (params?: { type?: string }) =>
    api.get<DeletionRequest[]>("/api/admin/blog/deletion-reviews", { params }),
  approve: (type: string, id: number, comment?: string) =>
    api.post<{ message: string }>(`/api/admin/blog/deletion-reviews/${type}/${id}/approve`, { comment }),
  reject: (type: string, id: number, comment?: string) =>
    api.post<{ message: string }>(`/api/admin/blog/deletion-reviews/${type}/${id}/reject`, { comment }),
}

export default function DeletionReviewsPage() {
  const logout = useAuth((s) => s.logout)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"" | "category" | "tag">("")
  const [authorizationError, setAuthorizationError] = useState(false)
  const [reviewingItem, setReviewingItem] = useState<DeletionRequest | null>(null)
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve")
  const [reviewComment, setReviewComment] = useState("")
  const queryClient = useQueryClient()

  // Fetch pending deletion requests
  const { data: requestsData, isLoading, error } = useQuery({
    queryKey: ["admin", "deletion-reviews", filterType],
    queryFn: () => deletionReviewApi.list({ type: filterType || undefined }),
  })

  const requests: DeletionRequest[] = Array.isArray(requestsData) ? requestsData : []

  // Filter by search term
  const filteredRequests = requests.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requested_by.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ type, id, comment }: { type: string; id: number; comment?: string }) =>
      deletionReviewApi.approve(type, id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "deletion-reviews"] })
      setReviewingItem(null)
      setReviewComment("")
      Swal.fire({
        icon: "success",
        title: "Approved",
        text: "The deletion request has been approved and the item has been deleted.",
        timer: 2000,
      })
    },
    onError: (error: any) => {
      Swal.fire({ icon: "error", title: "Error", text: error.message || "Failed to approve deletion" })
    },
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ type, id, comment }: { type: string; id: number; comment?: string }) =>
      deletionReviewApi.reject(type, id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "deletion-reviews"] })
      setReviewingItem(null)
      setReviewComment("")
      Swal.fire({
        icon: "info",
        title: "Rejected",
        text: "The deletion request has been rejected and the author has been notified.",
        timer: 2000,
      })
    },
    onError: (error: any) => {
      Swal.fire({ icon: "error", title: "Error", text: error.message || "Failed to reject deletion" })
    },
  })

  useEffect(() => {
    if (error) {
      const status = (error as any).status
      if (status === 403) {
        setAuthorizationError(true)
      } else if (status === 401) {
        logout()
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to load deletion requests"
        Swal.fire({ icon: "error", title: "Error", text: errorMessage })
      }
    }
  }, [error, logout])

  const openReviewDialog = (item: DeletionRequest, action: "approve" | "reject") => {
    setReviewingItem(item)
    setReviewAction(action)
    setReviewComment("")
  }

  const handleReview = () => {
    if (!reviewingItem) return

    if (reviewAction === "approve") {
      approveMutation.mutate({
        type: reviewingItem.type,
        id: reviewingItem.id,
        comment: reviewComment || undefined,
      })
    } else {
      rejectMutation.mutate({
        type: reviewingItem.type,
        id: reviewingItem.id,
        comment: reviewComment || undefined,
      })
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  if (authorizationError) {
    return <Unauthorized actionHref="/admin" />
  }

  return (
    <AdminDashboardShell title="Deletion Reviews">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pending Deletion Requests</CardTitle>
                <CardDescription>
                  Review and approve or reject deletion requests from authors
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {filteredRequests.length} pending
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Search</label>
                <div className="relative mt-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Filter by type</label>
                <select
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as "" | "category" | "tag")}
                >
                  <option value="">All</option>
                  <option value="category">Categories</option>
                  <option value="tag">Tags</option>
                </select>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left font-medium">Type</th>
                    <th className="px-4 py-2 text-left font-medium">Name</th>
                    <th className="px-4 py-2 text-left font-medium">Requested By</th>
                    <th className="px-4 py-2 text-left font-medium">Requested At</th>
                    <th className="px-4 py-2 text-left font-medium">Posts</th>
                    <th className="px-4 py-2 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        {isLoading ? "Loading requests..." : "No pending deletion requests"}
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr
                        key={`${request.type}-${request.id}`}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <td className="px-4 py-2">
                          <Badge variant={request.type === "category" ? "default" : "secondary"}>
                            {request.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 font-medium">{request.name}</td>
                        <td className="px-4 py-2">
                          <div className="text-sm">{request.requested_by.username}</div>
                          <div className="text-xs text-muted-foreground">{request.requested_by.email}</div>
                        </td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {formatDate(request.requested_at)}
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {request.post_count || 0} post{request.post_count !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => openReviewDialog(request, "approve")}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => openReviewDialog(request, "reject")}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!reviewingItem} onOpenChange={(open) => !open && setReviewingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve" ? "Approve Deletion" : "Reject Deletion"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? `Are you sure you want to approve the deletion of "${reviewingItem?.name}"? This action cannot be undone.`
                : `Rejecting the deletion request will notify the author and keep the ${reviewingItem?.type} intact.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Comment (optional)</Label>
              <Textarea
                id="comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={
                  reviewAction === "approve"
                    ? "Add a note for the audit log..."
                    : "Provide a reason for rejection (will be sent to the author)..."
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewingItem(null)}>
              Cancel
            </Button>
            <Button
              variant={reviewAction === "approve" ? "default" : "destructive"}
              onClick={handleReview}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {approveMutation.isPending || rejectMutation.isPending
                ? "Processing..."
                : reviewAction === "approve"
                ? "Approve & Delete"
                : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminDashboardShell>
  )
}
