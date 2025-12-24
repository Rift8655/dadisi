"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/store/auth"
import { authApi } from "@/lib/api"
import { showError, showSuccess } from "@/lib/sweetalert"
import type { AuthUser } from "@/contracts/auth.contract"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState("")

  useEffect(() => {
    const handleVerifyEmail = async () => {
      const code = searchParams.get("code")

      if (!code) {
        setError(null)
        setIsLoading(false)
        return
      }

      setIsVerifying(true)

      try {
        const response = await authApi.verifyEmail({ code })
        if (response.token && response.user) {
          // Use setAuth to properly set both user and token - this makes the user signed in
          setAuth(response.user as AuthUser, response.token)
        }

        await showSuccess(
          "Email Verified!",
          "Your email has been successfully verified."
        )

        router.push("/dashboard")
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to verify email"
        setError(message)
      } finally {
        setIsVerifying(false)
        setIsLoading(false)
      }
    }

    handleVerifyEmail()
  }, [searchParams, router, setAuth])

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setError(null)

    try {
      const response = await authApi.verifyEmail({ code: manualCode })
      if (response.token && response.user) {
        // Use setAuth to properly set both user and token - this makes the user signed in
        setAuth(response.user as AuthUser, response.token)
      }

      await showSuccess(
        "Email Verified!",
        "Your email has been successfully verified."
      )

      router.push("/dashboard")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to verify email"
      setError(message)
      await showError("Verification failed", message)
    } finally {
      setIsVerifying(false)
    }
  }

  if (isLoading && isVerifying) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Verifying Email</CardTitle>
            <CardDescription>
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            {error
              ? "Enter the code from your email to verify your account"
              : "Check your email for a verification code"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleManualVerify}>
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder="Enter code from email"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                disabled={isVerifying}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isVerifying}>
              {isVerifying ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>Loading</CardTitle>
              <CardDescription>Please wait...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
