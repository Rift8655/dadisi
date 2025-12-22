"use client"

import { create } from "zustand"

type Comment = { id: string; author: string; message: string; date: string }

type CommentsState = {
  comments: Record<string, Comment[]>
  add: (slug: string, c: Omit<Comment, "id" | "date">) => void
}

export const useCommentsStore = create<CommentsState>((set) => ({
  comments: {},
  add: (slug, c) =>
    set((s) => ({
      comments: {
        ...s.comments,
        [slug]: [
          ...(s.comments[slug] ?? []),
          {
            id: Math.random().toString(36).slice(2),
            date: new Date().toISOString(),
            ...c,
          },
        ],
      },
    })),
}))
