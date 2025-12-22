"use client"

import { useState } from "react"
import { useAuth } from "@/store/auth"

// authApi import removed; using `useAuth.sendVerification` instead
import { showError, showSuccess } from "@/lib/sweetalert"
import { Button } from "@/components/ui/button"

interface VerifyEmailButtonProps {
  className?: string
}

export function VerifyEmailButton({ className }: VerifyEmailButtonProps) {
  const user = useAuth((s) => s.user)
  const sendingVerification = useAuth((s) => s.sendingVerification)
  const sendVerification = useAuth((s) => s.sendVerification)

  if (!user || user.email_verified_at) {
    return null
  }

  const handleSendVerification = async () => {
    try {
      await sendVerification()
      await showSuccess(
        "Verification Email Sent",
        "Please check your email for the verification code."
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send verification email"
      if (err instanceof Error && (err as any).status === 429) {
        await showError("Too Many Requests", "Please wait before trying again.")
      } else {
        await showError("Error", message)
      }
    }
  }

  return (
    <Button
      onClick={handleSendVerification}
      disabled={sendingVerification}
      className={className}
      aria-label="Send verification email"
    >
      {sendingVerification ? (
        <>
          <span className="mr-2 animate-spin">⟳</span>
          Sending...
        </>
      ) : (
        "Verify Email"
      )}
    </Button>
  )
}
