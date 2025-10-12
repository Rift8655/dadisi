"use client"

import { useEffect, useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { RSVPDetails } from "@/store/useRsvpStore"
import { useToastStore } from "@/store/useToastStore"

export function RsvpDialog({ open, onOpenChange, onSubmit }: { open: boolean; onOpenChange: (v: boolean) => void; onSubmit: (details: RSVPDetails) => void }) {
  const titleId = useId()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [guests, setGuests] = useState(1)
  const [note, setNote] = useState("")

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false)
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(20rem,92vw,34rem)] p-4">
        <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative w-full rounded-xl border bg-card text-card-foreground shadow-2xl max-h-[min(90vh,36rem)] overflow-y-auto">
          <div className="border-b p-4"><h2 id={titleId} className="text-lg font-semibold">Event RSVP</h2></div>
          <form
            className="space-y-4 p-6"
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit({ name, email, guests, note: note || undefined })
              onOpenChange(false)
            }}
          >
            <div>
              <Label htmlFor="rsvp-name">Full name</Label>
              <Input id="rsvp-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="rsvp-email">Email</Label>
              <Input id="rsvp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="rsvp-guests">Guests (including you)</Label>
              <Input id="rsvp-guests" type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value))} required />
            </div>
            <div>
              <Label htmlFor="rsvp-note">Note (optional)</Label>
              <Input id="rsvp-note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Confirm RSVP</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RsvpDialog
