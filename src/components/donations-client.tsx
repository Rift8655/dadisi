"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/store/auth"
import { useDonationStore } from "@/store/donations"
import Swal from "sweetalert2"

import { useCreateDonation } from "@/hooks/useDonations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const DEFAULT_CONFIG = {
  presetAmounts: [500, 1000, 2000, 5000, 10000],
  currency: "KES",
}

export function DonationsClient({
  config = DEFAULT_CONFIG,
}: {
  config?: {
    presetAmounts: number[]
    currency: string
    thankYouMessage?: string
  }
}) {
  const router = useRouter()
  const createMut = useCreateDonation()
  const { setLastDonation } = useDonationStore()

  const [amount, setAmount] = useState<number | "">(config.presetAmounts[0])
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const { user, isAuthenticated } = useAuth()

  // Pre-fill form if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.member_profile) {
        setFirstName((prev) => prev || user.member_profile?.first_name || "")
        setLastName((prev) => prev || user.member_profile?.last_name || "")
      }
      setEmail((prev) => prev || user.email || "")
    }
  }, [isAuthenticated, user])

  const handleDonate = async () => {
    const amt = typeof amount === "number" ? amount : 0
    if (amt <= 0 || !email || !firstName || !lastName) {
      Swal.fire("Error", "Please fill in all required fields", "warning")
      return
    }

    try {
      const res = await createMut.mutateAsync({
        amount: amt,
        currency: config.currency,
        email,
        first_name: firstName,
        last_name: lastName,
        message: message || undefined,
        is_anonymous: false,
      })

      const data = (res as any).data ?? res // normalize response
      if (data.redirect_url) {
        setLastDonation({
          amount: amt,
          currency: config.currency,
          name: firstName,
        })
        window.location.href = data.redirect_url
      } else {
        Swal.fire(
          "Success",
          "Donation recorded (manual bank transfer)",
          "success"
        )
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : String(err ?? "Failed to process donation")
      Swal.fire("Error", message, "error")
    }
  }

  return (
    <div>
      <div className="max-w-md space-y-4">
        <div>
          <Label className="mb-1 block">Amount ({config.currency})</Label>
          <div className="flex flex-wrap gap-2">
            {config.presetAmounts.map((a) => (
              <Button
                key={a}
                variant={amount === a ? "default" : "outline"}
                onClick={() => setAmount(a)}
              >
                {a}
              </Button>
            ))}
            <Input
              type="number"
              placeholder="Custom"
              value={amount === "" ? "" : amount}
              onChange={(e) =>
                setAmount(e.target.value ? Number(e.target.value) : "")
              }
              className="w-28"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fname" className="mb-1 block">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fname"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lname" className="mb-1 block">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lname"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="mb-1 block">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="msg" className="mb-1 block">
            Message (optional)
          </Label>
          <Textarea
            id="msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button
          onClick={handleDonate}
          disabled={
            !(typeof amount === "number" && amount > 0) || createMut.isPending
          }
          className="w-full"
        >
          {createMut.isPending ? "Processing..." : "Donate Now"}
        </Button>
      </div>
    </div>
  )
}
