"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { authApi } from "@/lib/api"
import Swal from "sweetalert2"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const emailParam = searchParams.get("email")

  const [email, setEmail] = useState(emailParam || "")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !email || !password || !passwordConfirmation) return
    
    setLoading(true)
    try {
      await authApi.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      Swal.fire("Success", "Password reset successfully. Please login.", "success")
      router.push("/") // Redirect to home/login
    } catch (error: unknown) {
      let message = "Failed to reset password."
      if (typeof error === "object" && error !== null) {
        const e = error as { message?: string }
        message = e.message ?? message
      }
      Swal.fire("Error", message, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!!emailParam}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full" disabled={loading}>
                {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
