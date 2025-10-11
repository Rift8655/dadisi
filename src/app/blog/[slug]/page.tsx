"use client"

import fs from "node:fs"
import path from "node:path"
import Image from "next/image"
import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCommentsStore } from "@/store/useCommentsStore"

function usePost(slug: string) {
  const file = path.join(process.cwd(), "public/data/blog.json")
  const raw = fs.readFileSync(file, "utf8")
  const posts = JSON.parse(raw) as any[]
  return posts.find((p) => p.slug === slug)
}

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>()
  const post = usePost(params.slug)
  const { comments, add } = useCommentsStore()
  const list = comments[params.slug] ?? []

  const [name, setName] = useState("")
  const [message, setMessage] = useState("")

  if (!post) {
    return <div className="container py-10">Post not found.</div>
  }

  return (
    <div className="container py-10">
      <h1 className="mb-2 text-3xl font-bold">{post.title}</h1>
      <p className="mb-6 text-sm text-muted-foreground">By {post.author} • {new Date(post.published_at).toLocaleDateString()}</p>
      <div className="relative mb-6 aspect-video w-full">
        <Image src={post.image} alt={post.title} fill className="rounded-md object-cover" />
      </div>
      <p className="mb-10 leading-7 text-muted-foreground">{post.content}</p>

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
              add(params.slug, { author: name, message })
              setMessage("")
            }}
          >
            Post comment
          </Button>
        </div>
      </section>
    </div>
  )
}
