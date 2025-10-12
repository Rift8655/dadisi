"use client"

import { useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToastStore } from "@/store/useToastStore"

export type AuthDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [tab, setTab] = useState<"signin" | "register">("signin")
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onOpenChange])

  if (!open) return null

  const close = () => onOpenChange(false)
  const target = typeof document !== "undefined" ? document.body : null
  if (!target) return null

  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(20rem,92vw,40rem)] p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative w-full rounded-xl border bg-card text-card-foreground shadow-2xl max-h-[min(90vh,40rem)] overflow-y-auto"
        >
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-md p-2 text-foreground/70 transition hover:bg-accent hover:text-accent-foreground"
          >
            ✕
          </button>
          <div className="grid grid-cols-2 border-b">
            <button
              className={`px-4 py-3 text-sm font-medium transition ${
                tab === "signin" ? "border-b-2 border-primary text-foreground" : "text-foreground/60 hover:text-foreground"
              }`}
              onClick={() => setTab("signin")}
            >
              Sign in
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium transition ${
                tab === "register" ? "border-b-2 border-primary text-foreground" : "text-foreground/60 hover:text-foreground"
              }`}
              onClick={() => setTab("register")}
            >
              Register
            </button>
          </div>

          {tab === "signin" ? (
            <form
              className="space-y-4 p-6"
              onSubmit={(e) => {
                e.preventDefault()
                close()
              }}
            >
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" autoComplete="current-password" required />
              </div>
              <Button type="submit" className="w-full">Sign in</Button>
            </form>
          ) : (
            <form
              className="space-y-4 p-6"
              onSubmit={(e) => {
                e.preventDefault()
                close()
              }}
            >
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" type="text" autoComplete="name" required />
              </div>
              <div>
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div>
                <Label htmlFor="reg-password">Password</Label>
                <Input id="reg-password" name="password" type="password" autoComplete="new-password" required />
              </div>
              <Button type="submit" className="w-full">Create account</Button>
            </form>
          )}
        </div>
      </div>
    </div>,
    target
  )
}

export default AuthDialog
