import { create } from "zustand"

export type Toast = { id: number; message: string }

type ToastState = {
  toasts: Toast[]
  show: (message: string) => void
  remove: (id: number) => void
}

let idSeq = 1

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message) =>
    set((s) => ({ toasts: [...s.toasts, { id: idSeq++, message }] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
