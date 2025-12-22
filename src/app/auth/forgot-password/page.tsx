"use client"
import React, { useState } from "react"
import { useSendResetEmail } from "@/hooks/useAuth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const mutation = useSendResetEmail()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({ email })
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Forgot password</h1>
      <form onSubmit={onSubmit}>
        <label className="block mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-2 py-1 mb-4"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Sending..." : "Send reset link"}
        </button>
      </form>

      {mutation.isError && (
        <div className="mt-4 text-red-600">{(mutation.error as any)?.message || "Failed"}</div>
      )}

      {mutation.isSuccess && (
        <div className="mt-4 text-green-600">Reset link sent.</div>
      )}
    </div>
  )
}
