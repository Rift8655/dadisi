"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type {
  CampaignDonationInput,
  DonationCampaign,
} from "@/schemas/campaign"
import { useAuth } from "@/store/auth"
import { Loader2 } from "lucide-react"
import Swal from "sweetalert2"

import { campaignsApi } from "@/lib/api"
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

interface CampaignDonateFormProps {
  campaign: DonationCampaign
  onSuccess?: () => void
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000]

export function CampaignDonateForm({
  campaign,
  onSuccess,
}: CampaignDonateFormProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)

  const [amount, setAmount] = useState<number | "">(PRESET_AMOUNTS[1])
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  // Pre-fill form if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.member_profile) {
        setFirstName((prev) => prev || user.member_profile?.first_name || "")
        setLastName((prev) => prev || user.member_profile?.last_name || "")
        setPhone((prev) => prev || user.member_profile?.phone_number || "")
      }
      setEmail((prev) => prev || user.email || "")
    }
  }, [isAuthenticated, user])

  const effectiveMin = campaign.effective_minimum_amount
  const minDonation = effectiveMin ?? 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amt = typeof amount === "number" ? amount : 0
    if (amt < minDonation) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Amount",
        text: `Minimum donation for this campaign is ${campaign.currency} ${minDonation.toLocaleString()}`,
      })
      return
    }

    if (!email || !firstName || !lastName) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all required fields",
      })
      return
    }

    setLoading(true)

    try {
      const payload: CampaignDonationInput = {
        amount: amt,
        currency: campaign.currency as "KES" | "USD",
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone || undefined,
        message: message || undefined,
      }

      const response = await campaignsApi.donate(campaign.slug, payload)

      if (response.success && response.data.redirect_url) {
        Swal.fire({
          icon: "success",
          title: "Donation Initiated!",
          text: `Thank you for your ${campaign.currency} ${amt.toLocaleString()} donation to "${campaign.title}"`,
          timer: 3000,
          showConfirmButton: false,
        })

        // Redirect to payment page
        window.location.href = response.data.redirect_url
      } else {
        onSuccess?.()
      }
    } catch (error: any) {
      console.error("Donation failed:", error)
      Swal.fire({
        icon: "error",
        title: "Donation Failed",
        text: error.message || "Something went wrong. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount Selection */}
      <div className="space-y-2">
        <Label>Donation Amount ({campaign.currency})</Label>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_AMOUNTS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={amount === preset ? "default" : "outline"}
              size="sm"
              onClick={() => setAmount(preset)}
            >
              {preset.toLocaleString()}
            </Button>
          ))}
        </div>
        <Input
          type="number"
          placeholder="Custom amount"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value ? Number(e.target.value) : "")
          }
          min={minDonation}
          className="mt-2"
        />
        {effectiveMin && effectiveMin > 1 && (
          <p className="text-xs text-muted-foreground">
            Minimum: {campaign.currency} {effectiveMin.toLocaleString()}
          </p>
        )}
      </div>

      {/* Personal Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+254..."
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Leave a message of support..."
          rows={3}
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Donate ${campaign.currency} ${typeof amount === "number" ? amount.toLocaleString() : "0"}`
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Payments are securely processed. Your donation supports {campaign.title}
        .
      </p>
    </form>
  )
}
