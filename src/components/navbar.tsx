"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/store/auth"
import { LayoutDashboard, LogOut, Menu, Shield, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { useLogout } from "@/hooks/useAuth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { NotificationDropdown } from "@/components/notification-dropdown"

const links = [
  { href: "/", label: "Home" },
  { href: "/membership", label: "Membership" },
  { href: "/events", label: "Events" },
  { href: "/spaces", label: "Lab Spaces" },
  { href: "/blog", label: "Blog" },
  { href: "/forum", label: "Forum" },
  { href: "/donations", label: "Donations" },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  // const storeMember and useMemberProfileQuery are no longer needed for auth/staff check logic
  // if they are used elsewhere in navbar, keep them, but looking at usage:
  // member was used for isStaff check (deleted)
  // storeMember used for isStaff check (deleted)
  // So likely safe to remove deeply.

  const { mutate: logout } = useLogout()

  const user = useAuth((state) => state.user)
  const authDialogState = useAuth((state) => state.authDialogState)
  const setAuthDialogOpen = useAuth((state) => state.setAuthDialogOpen)

  const [menuOpen, setMenuOpen] = useState(false)

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
        <AuthDialog
          open={authDialogState.open}
          onOpenChange={(open) => setAuthDialogOpen(open)}
          defaultTab={authDialogState.tab}
        />
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold"
          aria-label="Dadisi home"
        >
          <span className="sr-only">Dadisi</span>
          {/* Mobile View - Light Mode */}
          <Image
            src="/images/brand/logo-mobile-light.png"
            alt="Dadisi"
            width={32}
            height={32}
            className="block h-8 w-auto dark:hidden sm:hidden"
            unoptimized
            priority
          />
          {/* Mobile View - Dark Mode */}
          <Image
            src="/images/brand/logo-mobile-dark.png"
            alt="Dadisi"
            width={32}
            height={32}
            className="hidden h-8 w-auto dark:block sm:dark:hidden"
            unoptimized
            priority
          />

          {/* Desktop View - Light Mode */}
          <Image
            src="/images/brand/logo-desktop-light.png"
            alt="Dadisi"
            width={140}
            height={32}
            className="hidden h-8 w-auto dark:hidden sm:block"
            unoptimized
            priority
          />
          {/* Desktop View - Dark Mode */}
          <Image
            src="/images/brand/logo-desktop-dark.png"
            alt="Dadisi"
            width={140}
            height={32}
            className="hidden h-8 w-auto dark:sm:block"
            unoptimized
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
          <NotificationDropdown />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={
                        user.profile_picture_url || "/images/default-avatar.png"
                      }
                    />
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                      {user.username?.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{user.username}</span>
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
            <Button
              variant="outline"
              onClick={() => setAuthDialogOpen(true, "signin")}
            >
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
