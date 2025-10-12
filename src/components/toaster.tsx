"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useToastStore } from "@/store/useToastStore"

export default function Toaster() {
  const { toasts, remove } = useToastStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const container = document.getElementById("toaster-root")
  if (!container) return null

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4">
      <div className="flex w-full max-w-md flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} id={t.id} message={t.message} onDone={() => remove(t.id)} />
        ))}
      </div>
    </div>,
    container
  )
}

function ToastItem({ id, message, onDone }: { id: number; message: string; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3000)
    return () => clearTimeout(timer)
  }, [onDone])
  return (
    <div className="pointer-events-auto rounded-md border bg-popover px-4 py-3 text-popover-foreground shadow-lg">
      <div className="text-sm font-medium">{message}</div>
    </div>
  )
}
