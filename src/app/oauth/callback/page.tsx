"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/store/auth"

import { showError, showSuccess } from "@/lib/sweetalert"

export default function OAuthCallbackPage() {
  const router = useRouter()
  const setToken = useAuth((s) => s.setToken)
  const hasExecuted = useRef(false)

  useEffect(() => {
    if (hasExecuted.current) {
      console.log("OAuth callback - skipping duplicate execution")
      return
    }

    hasExecuted.current = true

    const handleCallback = async () => {
      console.log("OAuth callback triggered (single execution)")
      console.log("Current location:", window.location.href)
      console.log("Hash:", window.location.hash)

      if (window.location.hash) {
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)

        console.log("Parsed params:", Object.fromEntries(params.entries()))

        // Check for error
        const error = params.get("error")
        console.log("Error param:", error)

        if (error) {
          let errorMessage = "There was an error signing you in with Google."

          if (error === "signup_required") {
            errorMessage =
              "No account found with this email. Please sign up first before linking Google."
            console.log("Handling signup_required error")
          } else if (error === "invalid_account") {
            errorMessage =
              "There was an issue with your account. Please try again or contact support."
            console.log("Handling invalid_account error")
          } else if (error === "email_verification_required") {
            errorMessage =
              "Please verify your email address first before linking Google authentication. Check your email for the verification link."
            console.log(
              "Handling email_verification_required error - security block"
            )
          } else {
            console.log("Unknown error type:", error)
          }

          console.log("Showing SweetAlert error with message:", errorMessage)
          await showError("Authentication failed", errorMessage)

          // User clicks OK, then redirect
          console.log("User confirmed error alert, redirecting to /")
          router.push("/")
          return
        }

        // Handle successful authentication
        const accessToken = params.get("access_token")
        const userJson = params.get("user")

        if (accessToken && userJson) {
          try {
            const user = JSON.parse(userJson)
            await setToken(accessToken)

            await showSuccess("Signed in", `Welcome back, ${user.name}!`)

            router.push("/dashboard")
          } catch (error) {
            console.error("OAuth callback error:", error)
            await showError(
              "Authentication failed",
              "There was an error signing you in with Google."
            )
            router.push("/")
          }
        } else {
          await showError(
            "Authentication failed",
            "Missing authentication data."
          )
          router.push("/")
        }
      }
    }

    handleCallback()
  }, [router, setToken])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
