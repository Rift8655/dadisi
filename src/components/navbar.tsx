"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import AuthDialog from "@/components/auth-dialog"

const links = [
  { href: "/", label: "Home" },
  { href: "/membership", label: "Membership" },
  { href: "/events", label: "Events" },
  { href: "/blog", label: "Blog" },
  { href: "/donations", label: "Donations" },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between gap-2">
        <AuthDialog open={open} onOpenChange={setOpen} />
        <Link href="/" className="flex items-center gap-2 font-semibold" aria-label="Dadisi home">
          <span className="sr-only">Dadisi</span>
          <Image
            src="https://cdn.builder.io/api/v1/image/assets%2F18afee9d3b294226ab5e0dde6ffaa839%2Ff43e3876c5154de6b73c20c6853ecf82?format=webp&width=240"
            alt="Dadisi icon"
            width={28}
            height={28}
            className="block sm:hidden"
            priority
          />
          <Image
            src="https://cdn.builder.io/api/v1/image/assets%2F18afee9d3b294226ab5e0dde6ffaa839%2Fced30502f028407e94a768a4a8d27ddb?format=webp&width=400"
            alt="Dadisi"
            width={140}
            height={32}
            className="hidden sm:block"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === l.href ? "text-foreground" : "text-foreground/60"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setOpen(true)}>Sign in</Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="lg:hidden"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <ModeToggle />
        </div>
      </div>
      {open && (
        <div className="fixed inset-x-0 top-14 z-40 border-b bg-background lg:hidden">
          <nav className="divide-y divide-border">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block w-full px-6 py-3 text-left",
                  pathname === l.href ? "text-foreground" : "text-foreground/80"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
