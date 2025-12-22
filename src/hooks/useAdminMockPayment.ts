import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface MockPaymentTestPayload {
  amount: string
  description: string
  user_email: string
  payment_type?: string
}

export function useAdminMockPayment() {
  const [results, setResults] = useState<string[]>([])

  const mutation = useMutation({
    mutationFn: async (payload: MockPaymentTestPayload) => {
      setResults([])
      const paymentTypeLabels: Record<string, string> = {
        test: '🧪 Test',
        subscription: '💳 Subscription',
        donation: '❤️ Donation',
        event: '🎫 Event Ticket',
      }
      const paymentTypeLabel = paymentTypeLabels[payload.payment_type || 'test'] || payload.payment_type

      setResults(prev => [...prev, `🧪 Starting mock payment test...`])
      setResults(prev => [...prev, `📦 Payment type: ${paymentTypeLabel}`])
      setResults(prev => [...prev, `📝 Creating test payment record...`])

      const response = await api.post<{
        success: boolean
        message: string
        data: {
          payment_id: number
          tracking_id: string
          order_reference: string
          mock_payment_url: string
          amount: number
          currency: string
          status: string
          payment_type: string
        }
      }>("/api/payments/test-mock-payment", {
        amount: parseFloat(payload.amount),
        description: payload.description,
        user_email: payload.user_email,
        payment_type: payload.payment_type || 'test',
      })

      if (!response.success) {
        throw new Error(response.message || "Failed to create test payment")
      }

      const { tracking_id, mock_payment_url } = response.data

      setResults(prev => [...prev, `✅ Mock payment record created with tracking ID: ${tracking_id}`])
      setResults(prev => [...prev, `🔗 Mock payment URL: ${mock_payment_url}`])
      setResults(prev => [...prev, `💡 Click to visit and complete the mock payment`])
      setResults(prev => [...prev, ``, `🔗 Direct link: `, `${mock_payment_url}`])
      setResults(prev => [...prev, ``, `🪝 For webhook testing after completing payment:`])
      setResults(prev => [...prev, `curl -X POST http://localhost:8000/api/webhooks/pesapal \\`])
      setResults(prev => [...prev, `  -H "Content-Type: application/json" \\`])
      setResults(prev => [...prev, `  -d '{"OrderTrackingId": "${tracking_id}", "OrderNotificationType": "PAYMENT_COMPLETED"}'`])

      return response.data
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setResults(prev => [...prev, `❌ Test failed: ${errorMessage}`])
    }
  })

  return {
    ...mutation,
    results,
    setResults,
  }
}
