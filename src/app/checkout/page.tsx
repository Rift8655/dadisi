"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"

/**
 * Legacy checkout page - redirects to /checkout/subscription
 * This page is kept for backwards compatibility with old links
 */
function LegacyCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Preserve query parameters when redirecting
    const params = searchParams.toString()
    const redirectUrl = params 
      ? `/checkout/subscription?${params}` 
      : "/checkout/subscription"
    
    router.replace(redirectUrl)
  }, [router, searchParams])

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl text-center">
      <p className="text-muted-foreground">Redirecting to checkout...</p>
    </div>
  )
}

export default function LegacyCheckoutPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-12 px-4 max-w-4xl text-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <LegacyCheckoutContent />
    </Suspense>
  )
}
