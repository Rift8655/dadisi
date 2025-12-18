"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/store/auth"
import { useLogout } from "@/hooks/useAuth"
import { LayoutDashboard, LogOut, Menu, Shield, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AuthDialog from "@/components/auth-dialog"
import { ModeToggle } from "@/components/mode-toggle"

const links = [
  { href: "/", label: "Home" },
  { href: "/membership", label: "Membership" },
  { href: "/events", label: "Events" },
  { href: "/blog", label: "Blog" },
  { href: "/donations", label: "Donations" },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { mutate: logout } = useLogout()
  
  // Clean up unused selectors and state
  // const storeMember and useMemberProfileQuery are no longer needed for auth/staff check logic
  // if they are used elsewhere in navbar, keep them, but looking at usage:
  // member was used for isStaff check (deleted)
  // storeMember used for isStaff check (deleted)
  // So likely safe to remove deeply.
  
  const [authOpen, setAuthOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const user = useAuth((s) => s.user)

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between gap-2">
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold"
          aria-label="Dadisi home"
        >
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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  {user.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Show Admin Dashboard first if user has admin access */}
                {user.admin_access?.can_access_admin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4 text-amber-600" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {/* Always show User Dashboard and Profile for all logged-in users */}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    User Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={() => setAuthOpen(true)}>
              Sign in
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="lg:hidden"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <ModeToggle />
        </div>
      </div>
      {menuOpen && (
        <div className="fixed inset-x-0 top-14 z-40 border-b bg-background lg:hidden">
          <nav className="divide-y divide-border">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "block w-full px-6 py-3 text-left",
                  pathname === l.href ? "text-foreground" : "text-foreground/80"
                )}
              >
                {l.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => {
                  handleLogout()
                  setMenuOpen(false)
                }}
                className="block w-full px-6 py-3 text-left text-foreground/80 hover:text-foreground"
              >
                Sign out
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
