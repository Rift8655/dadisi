import fs from "fs"
import path from "path"
import Image from "next/image"
import { CommentsClient } from "@/components/comments-client"

export async function generateStaticParams() {
  const file = path.join(process.cwd(), "public/data/blog.json")
  const raw = fs.readFileSync(file, "utf8")
  const posts = JSON.parse(raw) as Array<{ slug: string }>
  return posts.map((p) => ({ slug: p.slug }))
}

function getPost(slug: string) {
  const file = path.join(process.cwd(), "public/data/blog.json")
  const raw = fs.readFileSync(file, "utf8")
  const posts = JSON.parse(raw) as any[]
  return posts.find((p) => p.slug === slug)
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)
  if (!post) return <div className="container py-10">Post not found.</div>
  return (
    <div className="container py-10">
      <h1 className="mb-2 text-3xl font-bold">{post.title}</h1>
      <p className="mb-6 text-sm text-muted-foreground">By {post.author} • {new Date(post.published_at).toLocaleDateString()}</p>
      <div className="relative mb-6 aspect-video w-full">
        <Image src={post.image} alt={post.title} fill unoptimized className="rounded-md object-cover" />
      </div>
      <p className="mb-10 leading-7 text-muted-foreground">{post.content}</p>
      <CommentsClient slug={params.slug} />
    </div>
  )
}
