"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const isDark = resolvedTheme === "dark"
  const toggle = () => setTheme(isDark ? "light" : "dark")

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render theme-dependent attributes until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <Button variant="outline" size="icon" onClick={toggle} aria-pressed={isDark} aria-label="Toggle theme">
      <Icons.sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Icons.moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
