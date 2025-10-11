"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCommentsStore } from "@/store/useCommentsStore"

export function CommentsClient({ slug }: { slug: string }) {
  const { comments, add } = useCommentsStore()
  const list = comments[slug] ?? []
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")

  return (
    <section className="max-w-xl space-y-4">
      <h2 className="text-xl font-semibold">Comments</h2>
      {list.length === 0 && (
        <p className="text-sm text-muted-foreground">Be the first to comment.</p>
      )}
      <ul className="space-y-3">
        {list.map((c) => (
          <li key={c.id} className="rounded-md border p-3">
            <div className="mb-1 text-sm font-medium">{c.author}</div>
            <div className="text-sm text-muted-foreground">{c.message}</div>
          </li>
        ))}
      </ul>

      <div className="grid gap-2">
        <div className="grid gap-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share your thoughts" />
        </div>
        <Button
          onClick={() => {
            if (!name || !message) return
            add(slug, { author: name, message })
            setMessage("")
          }}
        >
          Post comment
        </Button>
      </div>
    </section>
  )
}
