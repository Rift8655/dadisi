"use client"

import { useState } from "react"
import {
  Calendar,
  CheckCircle,
  ExternalLink,
  FileCheck,
  Mail,
  MapPin,
  School,
  XCircle,
} from "lucide-react"
import Swal from "sweetalert2"

import { AdminStudentApprovalRequest } from "@/types/admin"
import {
  getBaseConfig,
  showError,
  showSuccess,
  showWarning,
} from "@/lib/sweetalert"
import { formatDate } from "@/lib/utils"
import {
  useApproveStudentRequest,
  useRejectStudentRequest,
} from "@/hooks/useStudentApprovals"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface StudentApprovalDialogProps {
  request: AdminStudentApprovalRequest | null
  open: boolean
  onClose: () => void
}

export function StudentApprovalDialog({
  request,
  open,
  onClose,
}: StudentApprovalDialogProps) {
  const [adminNotes, setAdminNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)

  const approveMutation = useApproveStudentRequest()
  const rejectMutation = useRejectStudentRequest()

  if (!request) return null

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({
        id: request.id,
        admin_notes: adminNotes,
      })

      await Swal.fire({
        ...getBaseConfig(),
        icon: "success",
        title: "Approved",
        text: "Student request has been approved successfully.",
        timer: 2000,
        showConfirmButton: false,
      })

      onClose()
    } catch (error: any) {
      showError(
        "Approval Failed",
        error?.message || "An error occurred during approval."
      )
    }
  }

  const handleReject = async () => {
    if (!rejectionReason) {
      showWarning(
        "Reason Required",
        "Please provide a reason for rejecting the request."
      )
      return
    }

    try {
      await rejectMutation.mutateAsync({
        id: request.id,
        rejection_reason: rejectionReason,
        admin_notes: adminNotes,
      })

      await Swal.fire({
        ...getBaseConfig(),
        icon: "success",
        title: "Rejected",
        text: "Student request has been rejected.",
        timer: 2000,
        showConfirmButton: false,
      })

      onClose()
      setIsRejecting(false)
    } catch (error: any) {
      showError(
        "Rejection Failed",
        error?.message || "An error occurred during rejection."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Student Approval Request</DialogTitle>
          <DialogDescription>
            Verify student documentation and eligibility before approving.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <School className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Institution:</span>
              <span>{request.student_institution}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Student Email:</span>
              <span>{request.student_email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">County:</span>
              <span>{request.county}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Birth Date:</span>
              <span>
                {request.student_birth_date
                  ? formatDate(request.student_birth_date)
                  : "Not provided"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-md border bg-muted/50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileCheck className="h-4 w-4" />
                  Documentation
                </div>
                <a
                  href={request.documentation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-xs text-primary hover:underline"
                >
                  View File <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {request.documentation_url}
              </p>
            </div>

            {request.additional_notes && (
              <div className="space-y-1">
                <Label className="text-xs">User Notes:</Label>
                <div className="rounded-md border bg-muted/30 p-2 text-xs">
                  {request.additional_notes}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {isRejecting ? (
            <div className="space-y-2">
              <Label
                htmlFor="rejectionReason"
                className="text-sm font-medium text-red-600"
              >
                Rejection Reason (Visible to Student)
              </Label>
              <Input
                id="rejectionReason"
                placeholder="e.g., ID document is blurry or expired"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="adminNotes" className="text-sm font-medium">
              Internal Admin Notes
            </Label>
            <Textarea
              id="adminNotes"
              placeholder="Notes for other staff member (optional)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="h-20"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          <div>
            {isRejecting ? (
              <Button variant="ghost" onClick={() => setIsRejecting(false)}>
                Back
              </Button>
            ) : (
              request.status === "pending" && (
                <Button
                  variant="destructive"
                  onClick={() => setIsRejecting(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Request
                </Button>
              )
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {isRejecting ? (
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending
                  ? "Rejecting..."
                  : "Confirm Rejection"}
              </Button>
            ) : (
              request.status === "pending" && (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {approveMutation.isPending
                    ? "Approving..."
                    : "Approve Request"}
                </Button>
              )
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
