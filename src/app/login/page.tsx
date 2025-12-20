"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/store/auth"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuthDialogOpen = useAuth((s) => s.setAuthDialogOpen)

  useEffect(() => {
    // Open Dialog
    setAuthDialogOpen(true, "signin")
    
    // Preserve other query params if any (e.g. ?redirect=/dashboard)
    // We can handle post-login redirection logic here or in the AuthDialog/Store
    // For now, simply redirect to home to normalize the URL, or keep /login?
    // Redirecting to / is cleaner.
    
    const params = new URLSearchParams(searchParams.toString())
    // If we want to support ?redirect=..., we should pass that to the dialog or store?
    // The current AuthDialog doesn't seem to handle 'redirect after login' specifically, 
    // but the store logic might. 
    // Assuming simple behavior: Open dialog, show home page.
    
    router.replace(`/?${params.toString()}`)
  }, [setAuthDialogOpen, router, searchParams])

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}
