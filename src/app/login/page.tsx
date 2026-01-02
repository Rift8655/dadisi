"use client"

import { Suspense, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/store/auth"
import { Home, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"

function ExpiredSessionIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="sandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#2DD4BF" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Glass Body */}
      <path
        d="M60 40C60 40 60 70 100 85C140 70 140 40 140 40H60Z"
        fill="url(#glassGradient)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.1"
      />
      <path
        d="M60 160C60 160 60 130 100 115C140 130 140 160 140 160H60Z"
        fill="url(#glassGradient)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.1"
      />

      {/* Connecting Neck */}
      <rect
        x="98"
        y="85"
        width="4"
        height="30"
        fill="url(#sandGradient)"
        opacity="0.3"
      >
        <animate
          attributeName="opacity"
          values="0.3;0.8;0.3"
          dur="2s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Top Sand (Emptying) */}
      <path
        d="M70 45C70 45 75 65 100 75C125 65 130 45 130 45H70Z"
        fill="url(#sandGradient)"
        opacity="0.6"
      >
        <animate
          attributeName="d"
          values="M70 45C70 45 75 65 100 75C125 65 130 45 130 45H70Z;M85 70C85 70 90 73 100 75C110 73 115 70 115 70H85Z;M70 45C70 45 75 65 100 75C125 65 130 45 130 45H70Z"
          dur="10s"
          repeatCount="indefinite"
        />
      </path>

      {/* Bottom Sand (Filling) */}
      <path
        d="M65 155C65 155 70 135 100 120C130 135 135 155 135 155H65Z"
        fill="url(#sandGradient)"
        filter="url(#glow)"
      >
        <animate
          attributeName="d"
          values="M90 158C90 158 95 155 100 150C105 155 110 158 110 158H90Z;M65 155C65 155 70 135 100 120C130 135 135 155 135 155H65Z;M90 158C90 158 95 155 100 150C105 155 110 158 110 158H90Z"
          dur="10s"
          repeatCount="indefinite"
        />
      </path>

      {/* Frame */}
      <rect
        x="55"
        y="35"
        width="90"
        height="5"
        rx="2"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <rect
        x="55"
        y="160"
        width="90"
        height="5"
        rx="2"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <rect
        x="52"
        y="35"
        width="3"
        height="130"
        rx="1"
        fill="currentColor"
        fillOpacity="0.05"
      />
      <rect
        x="145"
        y="35"
        width="3"
        height="130"
        rx="1"
        fill="currentColor"
        fillOpacity="0.05"
      />
    </svg>
  )
}

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
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center p-4 text-center">
        <div className="mb-4 h-48 w-48 md:h-56 md:w-56">
          <ExpiredSessionIcon className="h-full w-full" />
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
