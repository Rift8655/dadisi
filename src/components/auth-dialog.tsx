"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useLogin, useSignup } from "@/hooks/useAuth"
import { createPortal } from "react-dom"
import { z } from "zod"

import { showError, showSuccess } from "@/lib/sweetalert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleIcon } from "@/components/icons"

export type AuthDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [tab, setTab] = useState<"signin" | "register">("signin")
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
  const signinFormRef = useRef<HTMLFormElement>(null)
  const signupFormRef = useRef<HTMLFormElement>(null)
  const titleId = useId()
  const signupMut = useSignup()
  const loginMut = useLogin()

  const signinSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  })

  const signupSchema = z
    .object({
      username: z
        .string()
        .min(2, "Username must be at least 2 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      "reg-password-confirm": z
        .string()
        .min(8, "Password confirmation is required"),
    })
    .refine((data) => data.password === data["reg-password-confirm"], {
      message: "Passwords do not match",
      path: ["reg-password-confirm"],
    })

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

  const handleGoogleSignin = () => {
    window.location.href =
      process.env.NEXT_PUBLIC_BACKEND_APP_URL + "/auth/google"
  }

  if (!open && !showVerificationDialog) return null

  const close = () => {
    onOpenChange(false)
    setFormErrors({})
  }

  const closeVerificationDialog = () => {
    setShowVerificationDialog(false)
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormErrors({})
    setValidationErrors({})
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const email = formData.get("reg-email") as string
    const password = formData.get("reg-password") as string
    const passwordConfirm = formData.get("reg-password-confirm") as string

    const validation = signupSchema.safeParse({
      username,
      email,
      password,
      "reg-password-confirm": passwordConfirm,
    })

    if (!validation.success) {
      const errors: Record<string, string> = {}
      validation.error.errors.forEach((error) => {
        errors[error.path[0] as string] = error.message
      })
      setValidationErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      await signupMut.mutateAsync({
        username,
        email,
        password,
        password_confirmation: passwordConfirm,
      })

      if (signupFormRef.current) {
        signupFormRef.current.reset()
      }

      await showSuccess(
        "Account created successfully!",
        "Please check your email and click the verification link to activate your account."
      )

      close()
      setTab("signin")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed"
      setFormErrors({ submit: message })
      await showError("Registration failed", message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormErrors({})
    setValidationErrors({})
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const validation = signinSchema.safeParse({
      email,
      password,
    })

    if (!validation.success) {
      const errors: Record<string, string> = {}
      validation.error.errors.forEach((error) => {
        errors[error.path[0] as string] = error.message
      })
      setValidationErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      const res = await loginMut.mutateAsync({ email, password })
      // login mutation delegates to auth store and returns { user, needsVerification }
      const { user, needsVerification } = res

      if (signinFormRef.current) {
        signinFormRef.current.reset()
      }

      if (needsVerification) {
        close()
        setShowVerificationDialog(true)
      } else {
        await showSuccess("Signed in", `Welcome back, ${user.username}!`)
        close()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed"
      setFormErrors({ submit: message })
      await showError("Login failed", message)
    } finally {
      setIsLoading(false)
    }
  }

  const target = typeof document !== "undefined" ? document.body : null
  if (!target) return null

  if (showVerificationDialog) {
    return createPortal(
      <div className="fixed inset-0 z-[60]">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={closeVerificationDialog}
        />
        <div className="fixed left-1/2 top-1/2 w-[clamp(20rem,92vw,40rem)] -translate-x-1/2 -translate-y-1/2 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full rounded-xl border bg-card text-card-foreground shadow-2xl"
          >
            <button
              onClick={closeVerificationDialog}
              aria-label="Close dialog"
              className="absolute right-3 top-3 rounded-md p-2 text-foreground/70 transition hover:bg-accent hover:text-accent-foreground"
            >
              ✕
            </button>
            <div className="p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="mb-2 text-xl font-semibold">Verify your email</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                {
                  "We've sent a verification link to your email address. Please check your inbox and click the link to verify your account and unlock all features."
                }
              </p>
              <Button onClick={closeVerificationDialog} className="w-full">
                Got it
              </Button>
            </div>
          </div>
        </div>
      </div>,
      target
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />
      <div className="fixed left-1/2 top-1/2 w-[clamp(20rem,92vw,40rem)] -translate-x-1/2 -translate-y-1/2 p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative max-h-[min(90vh,40rem)] w-full overflow-y-auto rounded-xl border bg-card text-card-foreground shadow-2xl"
        >
          <button
            onClick={close}
            aria-label="Close dialog"
            className="absolute right-3 top-3 rounded-md p-2 text-foreground/70 transition hover:bg-accent hover:text-accent-foreground"
          >
            ✕
          </button>
          <div className="grid grid-cols-2 border-b">
            <button
              className={`px-4 py-3 text-sm font-medium transition ${
                tab === "signin"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-foreground/60 hover:text-foreground"
              }`}
              onClick={() => setTab("signin")}
            >
              Sign in
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium transition ${
                tab === "register"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-foreground/60 hover:text-foreground"
              }`}
              onClick={() => setTab("register")}
            >
              Register
            </button>
          </div>

          {tab === "signin" ? (
            <div className="space-y-4 p-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignin}
              >
                <GoogleIcon className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <form
                ref={signinFormRef}
                className="space-y-4"
                onSubmit={handleSignin}
              >
                {formErrors.submit && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {formErrors.submit}
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-destructive">
                      {validationErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                  />
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-destructive">
                      {validationErrors.password}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <a 
                      href="/forgot-password" 
                      onClick={(e) => {
                         e.preventDefault();
                         close();
                         window.location.href = "/forgot-password";
                      }}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-4 p-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignin}
              >
                <GoogleIcon className="mr-2 h-4 w-4" />
                Sign Up with Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or Sign Up with Email
                  </span>
                </div>
              </div>
              <form
                ref={signupFormRef}
                className="space-y-4"
                onSubmit={handleSignup}
              >
                {formErrors.submit && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {formErrors.submit}
                  </div>
                )}
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    disabled={isLoading}
                  />
                  {validationErrors.username && (
                    <p className="mt-1 text-sm text-destructive">
                      {validationErrors.username}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    name="reg-email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={isLoading}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-destructive">
                      {validationErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    name="reg-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    placeholder="Must be 8+ chars with letters, numbers & special chars"
                  />
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-destructive">
                      {validationErrors.password}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="reg-password-confirm">Confirm password</Label>
                  <Input
                    id="reg-password-confirm"
                    name="reg-password-confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                  />
                  {validationErrors["reg-password-confirm"] && (
                    <p className="mt-1 text-sm text-destructive">
                      {validationErrors["reg-password-confirm"]}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>,
    target
  )
}

export default AuthDialog
