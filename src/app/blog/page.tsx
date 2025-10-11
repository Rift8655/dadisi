import fs from "node:fs"
import path from "node:path"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = { title: "Blog", description: "Stories and updates" }

function getPosts() {
  const file = path.join(process.cwd(), "public/data/blog.json")
  const raw = fs.readFileSync(file, "utf8")
  return JSON.parse(raw) as Array<{
    id: number
    title: string
    slug: string
    author: string
    published_at: string
    excerpt: string
    content: string
    image: string
  }>
}

export default function BlogPage() {
  const posts = getPosts()
  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Blog</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.title}</CardTitle>
              <CardDescription>
                By {p.author} • {new Date(p.published_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-3 aspect-video w-full">
                <Image src={p.image} alt={p.title} fill className="rounded-md object-cover" />
              </div>
              <p className="mb-3 text-sm text-muted-foreground">{p.excerpt}</p>
              <Link href={`/blog/${p.slug}`} className="text-primary underline-offset-4 hover:underline">
                Read more →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
