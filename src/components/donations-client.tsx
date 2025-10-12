"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToastStore } from "@/store/useToastStore"

export function DonationsClient({ config }: { config: { presetAmounts: number[]; currency: string; thankYouMessage: string } }) {
  const [amount, setAmount] = useState<number | "">(config.presetAmounts[0])
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const show = useToastStore((s) => s.show)

  return (
    <div>
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
            show("Feature unavailable: system under maintenance.")
          }}
          disabled={!(typeof amount === "number" && amount > 0)}
        >
          Donate
        </Button>
      </div>
    </div>
  )
}
