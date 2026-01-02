"use client"

import { Suspense, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/store/auth"
import { ArrowLeft, Home, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuthDialogOpen = useAuth((s) => s.setAuthDialogOpen)
  const isExpired = searchParams.get("expired") === "true"
  const redirect = searchParams.get("redirect")

  useEffect(() => {
    if (!isExpired) {
      // Normal login flow: Open Dialog and redirect to home (or the intended page)
      setAuthDialogOpen(true, "signin")

      const params = new URLSearchParams(searchParams.toString())
      router.replace(`/?${params.toString()}`)
    }
  }, [isExpired, setAuthDialogOpen, router, searchParams])

  if (isExpired) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8 h-64 w-64 md:h-80 md:w-80">
          <Image
            src="/session-expired.png"
            alt="Session Expired Illustration"
            fill
            className="object-contain"
            priority
          />
        </div>

        <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
          Session Expired
        </h1>
        <p className="mb-8 max-w-md text-lg text-muted-foreground">
          Your security matters. To keep your information safe, sessions time
          out after a period of inactivity. Please log in again to continue.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="gap-2 px-8"
            onClick={() => setAuthDialogOpen(true, "signin")}
          >
            <LogIn className="h-4 w-4" />
            Login Now
          </Button>
          <Button variant="outline" size="lg" className="gap-2 px-8" asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {redirect && (
          <p className="mt-8 text-sm text-muted-foreground">
            Once you log in, we'll take you back to{" "}
            <code className="rounded bg-muted px-2 py-0.5">{redirect}</code>
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
