import { useState } from "react"
import { useMutation } from "@tanstack/react-query"

import { api } from "@/lib/api"

export interface PesapalTestPayload {
  amount: string
  description: string
  user_email: string
  first_name?: string
  last_name?: string
  phone?: string
}

export function useAdminPesapalTest() {
  const [results, setResults] = useState<string[]>([])

  const mutation = useMutation({
    mutationFn: async (payload: PesapalTestPayload) => {
      setResults([])

      setResults((prev) => [
        ...prev,
        `🚀 Starting real Pesapal sandbox test...`,
      ])
      setResults((prev) => [
        ...prev,
        `📝 Contacting backend to initiate Pesapal session...`,
      ])

      const response = await api.post<{
        success: boolean
        message: string
        data: {
          payment_id: number
          tracking_id: string
          merchant_reference: string
          order_tracking_id: string
          redirect_url: string
          amount: number
          currency: string
        }
      }>("/api/payments/test-pesapal-payment", {
        amount: parseFloat(payload.amount),
        description: payload.description,
        user_email: payload.user_email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone: payload.phone,
      })

      if (!response.success) {
        throw new Error(
          response.message || "Failed to initiate Pesapal payment"
        )
      }

      const { order_tracking_id, redirect_url } = response.data

      setResults((prev) => [
        ...prev,
        `✅ Pesapal session initiated successfully!`,
      ])
      setResults((prev) => [
        ...prev,
        `🆔 Order Tracking ID: ${order_tracking_id}`,
      ])
      setResults((prev) => [...prev, `🔗 Redirecting to Pesapal Sandbox...`])
      setResults((prev) => [
        ...prev,
        ``,
        `🔗 Direct Redirect Link: `,
        `${redirect_url}`,
      ])

      // Open in new tab
      if (typeof window !== "undefined") {
        window.open(redirect_url, "_blank")
      }

      return response.data
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setResults((prev) => [...prev, `❌ Test failed: ${errorMessage}`])
    },
  })

  return {
    ...mutation,
    results,
    setResults,
  }
}
