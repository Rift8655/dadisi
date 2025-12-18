"use client"

import { useState } from "react"
import Swal from "sweetalert2"

import { Button } from "@/components/ui/button"

interface ConfirmationDialogProps {
  open: boolean
  title: string
  description: string
  actionLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmationDialog({
  open,
  title,
  description,
  actionLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const [loading, setLoading] = useState(isLoading)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Action completed successfully",
        timer: 1500,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred"
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 dark:bg-gray-950">
        <h2 className="mb-2 text-lg font-semibold">{title}</h2>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : actionLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
