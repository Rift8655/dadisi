"use client"

import fs from "node:fs"
import path from "node:path"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useDonationStore } from "@/store/useDonationStore"

function useDonationConfig() {
  const file = path.join(process.cwd(), "public/data/donations.json")
  const raw = fs.readFileSync(file, "utf8")
  return JSON.parse(raw) as { presetAmounts: number[]; currency: string; thankYouMessage: string }
}

export default function DonationsPage() {
  const config = useDonationConfig()
  const [amount, setAmount] = useState<number | "">(config.presetAmounts[0])
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const { last, donate } = useDonationStore()

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Donations</h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Support our mission to expand access to science across Kenya.
      </p>

      {last ? (
        <div className="mb-8 rounded-md border p-4 text-sm">
          <p className="mb-1">{config.thankYouMessage}</p>
          <p>
            Received: <strong>{config.currency} {last.amount}</strong>
            {last.name ? ` from ${last.name}` : ""}
          </p>
        </div>
      ) : null}

      <div className="max-w-md space-y-4">
        <div>
          <Label className="mb-1 block">Amount ({config.currency})</Label>
          <div className="flex flex-wrap gap-2">
            {config.presetAmounts.map((a) => (
              <Button key={a} variant={amount === a ? "default" : "outline"} onClick={() => setAmount(a)}>
                {a}
              </Button>
            ))}
            <Input
              type="number"
              placeholder="Custom"
              value={amount === "" ? "" : amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              className="w-28"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="name" className="mb-1 block">Name (optional)</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="msg" className="mb-1 block">Message (optional)</Label>
          <Textarea id="msg" value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <Button
          onClick={() => {
            const amt = typeof amount === "number" ? amount : 0
            if (amt <= 0) return
            donate({ amount: amt, name, message })
          }}
        >
          Donate
        </Button>
      </div>
    </div>
  )
}
