import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { adminApi } from "@/lib/api-admin"

export function useAdminStudentApprovals(filters?: {
  status?: string
  county?: string
  page?: number
  per_page?: number
}) {
  return useQuery({
    queryKey: ["admin", "student-approvals", filters],
    queryFn: () => adminApi.studentApprovals.list(filters),
  })
}

export function useAdminStudentApprovalDetails(id: number | null) {
  return useQuery({
    queryKey: ["admin", "student-approvals", id],
    queryFn: () => (id ? adminApi.studentApprovals.get(id) : null),
    enabled: !!id,
  })
}

export function useApproveStudentRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, admin_notes }: { id: number; admin_notes?: string }) =>
      adminApi.studentApprovals.approve(id, { admin_notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "student-approvals"],
      })
    },
  })
}

export function useRejectStudentRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      rejection_reason,
      admin_notes,
    }: {
      id: number
      rejection_reason: string
      admin_notes?: string
    }) =>
      adminApi.studentApprovals.reject(id, { rejection_reason, admin_notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "student-approvals"],
      })
    },
  })
}
