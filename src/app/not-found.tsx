"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, FlaskConical, Home, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden px-4 py-16">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Floating lab equipment icons */}
        {mounted && (
          <>
            <div className="animate-float absolute left-[10%] top-[20%] opacity-10">
              <FlaskConical className="h-24 w-24 text-primary" />
            </div>
            <div
              className="animate-float absolute right-[15%] top-[30%] opacity-10"
              style={{ animationDelay: "1s" }}
            >
              <FlaskConical className="h-16 w-16 rotate-12 text-primary" />
            </div>
            <div
              className="animate-float absolute bottom-[25%] left-[20%] opacity-10"
              style={{ animationDelay: "2s" }}
            >
              <FlaskConical className="h-20 w-20 -rotate-12 text-primary" />
            </div>
            <div
              className="animate-float absolute bottom-[30%] right-[10%] opacity-10"
              style={{ animationDelay: "0.5s" }}
            >
              <FlaskConical className="h-12 w-12 rotate-45 text-primary" />
            </div>
          </>
        )}

        {/* Gradient orbs */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-gradient-to-br from-green-500/20 to-primary/20 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* 404 Number with gradient */}
        <div className="relative mb-6">
          <h1 className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-[3rem] font-black leading-none tracking-tighter text-transparent sm:text-[4rem] md:text-[5rem]">
            404
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 blur-3xl" />
        </div>

        {/* Error message */}
        <div className="mb-8 space-y-3">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Page Not Found
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            Looks like this experiment didn&apos;t go as planned! The page
            you&apos;re looking for has gone missing from our lab.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/"
            className={cn(
              buttonVariants({ size: "lg" }),
              "group gap-2 transition-all hover:gap-3"
            )}
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/events"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "gap-2"
            )}
          >
            <Search className="h-4 w-4" />
            Explore Events
          </Link>
        </div>

        {/* Go back link */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back to previous page
        </button>
      </div>

      {/* Custom keyframe animation */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
