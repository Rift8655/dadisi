import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { vi, describe, it, expect, beforeEach } from "vitest"

import { usePosts, usePost } from "@/hooks/usePosts"
import { postsApi } from "@/lib/api"

vi.mock("@/lib/api", () => ({
  postsApi: {
    list: vi.fn(),
    getBySlug: vi.fn(),
  },
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient()
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

function ListComponent() {
  const { data: posts = [], isLoading } = usePosts()
  if (isLoading) return <div>loading</div>
  return (
    <div>
      {posts.map((p) => (
        <div key={p.id}>{p.title}</div>
      ))}
    </div>
  )
}

function SingleComponent({ slug }: { slug: string }) {
  const { data: post, isLoading } = usePost(slug)
  if (isLoading) return <div>loading</div>
  if (!post) return <div>no post</div>
  return <div>{post.title}</div>
}

describe("usePosts hooks", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls postsApi.list and returns posts", async () => {
    ;(postsApi.list as any).mockResolvedValue([ { id: 1, title: "T", slug: "t", excerpt: "e", content: "c", featured_image: null, author_id: 1, author: { id: 1, username: "u" }, is_published: true, published_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), tags: [] } ])

    render(
      <Wrapper>
        <ListComponent />
      </Wrapper>
    )

    await waitFor(() => expect(postsApi.list).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText("T")).toBeTruthy())
  })

  it("calls postsApi.getBySlug and returns single post", async () => {
    ;(postsApi.getBySlug as any).mockResolvedValue({ id: 2, title: "Single", slug: "single", excerpt: "e", content: "c", featured_image: null, author_id: 1, author: { id: 1, username: "u" }, is_published: true, published_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), tags: [] })

    render(
      <Wrapper>
        <SingleComponent slug="single" />
      </Wrapper>
    )

    await waitFor(() => expect(postsApi.getBySlug).toHaveBeenCalledWith("single"))
    await waitFor(() => expect(screen.getByText("Single")).toBeTruthy())
  })
})
