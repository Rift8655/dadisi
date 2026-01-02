"use client"

import { Component, ReactNode } from "react"
import { AlertTriangle, LogIn, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"

interface AuthErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface AuthErrorBoundaryState {
  hasError: boolean
  error: Error | null
  isAuthError: boolean
}

/**
 * Error boundary that gracefully handles authentication errors.
 * Shows a user-friendly UI with options to retry or log in.
 */
export class AuthErrorBoundary extends Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      isAuthError: false,
    }
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    const errorMessage = error.message?.toLowerCase() || ""
    const isAuthError =
      errorMessage.includes("session") ||
      errorMessage.includes("401") ||
      errorMessage.includes("unauthenticated") ||
      errorMessage.includes("expired") ||
      errorMessage.includes("unauthorized")

    return {
      hasError: true,
      error,
      isAuthError,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error("AuthErrorBoundary caught error:", error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, isAuthError: false })
  }

  handleLogin = () => {
    window.location.href =
      "/login?redirect=" + encodeURIComponent(window.location.pathname)
  }

  handleHome = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { isAuthError, error } = this.state

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>

          <h2 className="mb-2 text-xl font-semibold">
            {isAuthError ? "Session Expired" : "Something Went Wrong"}
          </h2>

          <p className="mb-6 max-w-md text-muted-foreground">
            {isAuthError
              ? "Your session has expired. Please log in again to continue."
              : "An unexpected error occurred. Please try again or contact support if the problem persists."}
          </p>

          {process.env.NODE_ENV === "development" && error && (
            <details className="mb-6 w-full max-w-lg rounded-lg bg-muted p-4 text-left text-sm">
              <summary className="cursor-pointer font-medium">
                Error Details
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
                {error.message}
                {"\n\n"}
                {error.stack}
              </pre>
            </details>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={this.handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            {isAuthError ? (
              <Button onClick={this.handleLogin}>
                <LogIn className="mr-2 h-4 w-4" />
                Log In
              </Button>
            ) : (
              <Button variant="secondary" onClick={this.handleHome}>
                Go Home
              </Button>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default AuthErrorBoundary
