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
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          <div className="relative block h-8 w-8 dark:hidden sm:hidden">
            <Image
              src="/images/brand/logo-mobile-light.png"
              alt="Dadisi"
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>
          {/* Mobile View - Dark Mode */}
          <div className="relative hidden h-8 w-8 dark:block sm:dark:hidden">
            <Image
              src="/images/brand/logo-mobile-dark-v2.png"
              alt="Dadisi"
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>

          {/* Desktop View - Light Mode */}
          <div className="relative hidden h-8 w-32 dark:hidden sm:block">
            <Image
              src="/images/brand/logo-desktop-light.png"
              alt="Dadisi"
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>
          {/* Desktop View - Dark Mode */}
          <div className="relative hidden h-8 w-32 dark:sm:block">
            <Image
              src="/images/brand/logo-desktop-dark-v2.png"
              alt="Dadisi"
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>
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
        <div className="fixed inset-x-0 top-14 z-50 border-b bg-background lg:hidden">
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
