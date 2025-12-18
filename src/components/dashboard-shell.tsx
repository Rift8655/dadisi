"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/store/auth"
import useMemberProfile from "@/store/memberProfile"
import {
  BarChart2,
  Calendar,
  ChevronDown,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Users,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)
  const pathname = usePathname()
  const user = useAuth((s) => s.user)
  const { adminAccess } = useAuth()
  
  const iconMap: Record<string, any> = {
    dashboard: LayoutDashboard,
    users: Users,
    calendar: Calendar,
    'file-text': BarChart2, // approximation for content
    shield: Users, // approximation
    'dollar-sign': CreditCard,
    settings: Menu, // approximation
  }

  const userLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/membership", label: "Membership", icon: Users },
    { href: "/donations", label: "Donations", icon: CreditCard },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/chat", label: "Chat", icon: MessageCircle },
    { href: "/support", label: "Support", icon: HelpCircle },
  ]

  const member = useMemberProfile((s) => s.member)
  const visibleAdminItems = adminAccess?.menu || []

  // Show admin menu if backend says so
  const shouldShowAdmin = Boolean(user?.ui_permissions.can_access_admin)

  const isAdminPath = (path: string) => {
    // If not visible, not an admin path relevant to show
    if (!visibleAdminItems.length) return false
    return visibleAdminItems.some((item) => pathname === item.path)
  }

  const renderSidebarLinks = (onNavigate?: () => void) => (
    <nav className="space-y-1">
      {userLinks.map((l) => {
        const Icon = l.icon
        const active = pathname === l.href
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              active ? "bg-accent text-accent-foreground" : "text-foreground/80"
            )}
          >
            <Icon className="h-4 w-4" />
            {l.label}
          </Link>
        )
      })}

      {shouldShowAdmin && (
        <>
          <button
            onClick={() => setAdminMenuOpen(!adminMenuOpen)}
            className={cn(
              "mt-4 flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              isAdminPath(pathname)
                ? "bg-accent text-accent-foreground"
                : "text-foreground/80"
            )}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Admin
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                adminMenuOpen ? "rotate-180" : ""
              )}
            />
          </button>

          {adminMenuOpen && (
            <div className="ml-4 space-y-1 border-l border-muted pl-4">
              {visibleAdminItems.map((item) => {
                const Icon = iconMap[item.icon] || Users
                const active = pathname === item.path
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground/80"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}
    </nav>
  )

  return (
    <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 lg:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="hidden border-r lg:block">
        <div className="sticky top-14 h-[calc(100vh-56px)] overflow-y-auto p-4">
          {renderSidebarLinks()}
        </div>
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-14 h-[calc(100vh-56px)] w-72 overflow-y-auto border-r bg-background p-4">
            <div className="mb-3 flex items-center justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {renderSidebarLinks(() => setOpen(false))}
          </div>
        </div>
      )}

      {/* Main */}
      <main className="min-w-0">
        <div className="flex items-center justify-between border-b px-4 py-3 lg:px-6">
          <h1 className="text-xl font-semibold">{title}</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}

export function StatCard({
  title,
  value,
  change,
  children,
}: {
  title: string
  value: string
  change?: string
  children?: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="text-xs text-muted-foreground">{change}</div>
        )}
        {children}
      </CardContent>
    </Card>
  )
}

export default DashboardShell
