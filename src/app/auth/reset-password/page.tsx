"use client"
import React, { useState, useEffect, Suspense } from "react"
import { useResetPassword } from "@/hooks/useAuth"
import { useSearchParams } from "next/navigation"

function ResetPasswordForm() {
  const search = useSearchParams()
  const token = search?.get("token") || ""
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const mutation = useResetPassword()

  useEffect(() => {
    const e = search?.get("email")
    if (e) setEmail(e)
  }, [search])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({ email, password, password_confirmation: passwordConfirmation, token })
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Reset password</h1>
      {!token && <div className="mb-4 text-yellow-700">No reset token provided.</div>}
      <form onSubmit={onSubmit}>
        <label className="block mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-2 py-1 mb-4"
          required
        />

        <label className="block mb-2">New password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-2 py-1 mb-4"
          required
        />

        <label className="block mb-2">Confirm password</label>
        <input
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          className="w-full border px-2 py-1 mb-4"
          required
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Resetting..." : "Reset password"}
        </button>
      </form>

      {mutation.isError && (
        <div className="mt-4 text-red-600">{(mutation.error as any)?.message || "Failed"}</div>
      )}

      {mutation.isSuccess && (
        <div className="mt-4 text-green-600">Password reset successful.</div>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto p-6">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
