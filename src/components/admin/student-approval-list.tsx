"use client"

import { useState } from "react"
import { CheckCircle, Eye, XCircle } from "lucide-react"

import { AdminStudentApprovalRequest } from "@/types/admin"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface StudentApprovalListProps {
  requests: AdminStudentApprovalRequest[]
  isLoading?: boolean
  onAction: (request: AdminStudentApprovalRequest) => void
  currentPage?: number
  totalPages?: number
  perPage?: number
  totalItems?: number
  onPageChange?: (page: number) => void
}

export function StudentApprovalList({
  requests,
  isLoading = false,
  onAction,
  currentPage = 1,
  totalPages = 1,
  perPage = 15,
  totalItems,
  onPageChange,
}: StudentApprovalListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
          >
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          >
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          >
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                Student Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                Institution
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                County
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                Submitted
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  {isLoading
                    ? "Loading requests..."
                    : "No student approval requests found"}
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr
                  key={request.id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {request.user_name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {request.student_email}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                    {request.student_institution}
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                    {request.county}
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(request.submitted_at)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onAction(request)}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <Eye className="mr-1 h-4 w-4 text-primary" />
                      Review
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Showing {(currentPage - 1) * perPage + 1} to{" "}
            {Math.min(currentPage * perPage, totalItems || 0)} of {totalItems}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
