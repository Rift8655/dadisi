"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/store/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react"

// Icon mapping – matches keys used in the JSON link files
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Shield,
  DollarSign,
  Settings,
  CreditCard,
  HelpCircle,
  MessageCircle,
  Image as ImageIcon,
} from "lucide-react"

const iconMap: Record<string, any> = {
  dashboard: LayoutDashboard,
  users: Users,
  calendar: Calendar,
  "file-text": FileText,
  shield: Shield,
  "dollar-sign": DollarSign,
  settings: Settings,
  creditcard: CreditCard,
  helpcircle: HelpCircle,
  messagecircle: MessageCircle,
  image: ImageIcon,
}

interface LinkItem {
  title: string
  href: string
  icon: string
  badge?: string | null
}

interface SidebarProps {
  role: "admin" | "user"
}

// Import link data
import adminLinks from "@/data/adminSidebarLinks.json"
import userLinks from "@/data/userSidebarLinks.json"

// Constants for layout dimensions
const SIDEBAR_WIDTH = 250
const SIDEBAR_COLLAPSED_WIDTH = 70
const NAVBAR_HEIGHT = 56 // h-14 = 3.5rem = 56px

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const { adminAccess } = useAuth()
  const [open, setOpen] = useState(false) // mobile overlay
  const [collapsed, setCollapsed] = useState(false) // tablet collapse

  // Load link data based on role
  const links: LinkItem[] = role === "admin" ? adminLinks : userLinks

  // Determine if we are on a dashboard route for this role
  const visible = role === "admin"
    ? pathname === "/admin" || pathname.startsWith("/admin/")
    : pathname === "/dashboard" || pathname.startsWith("/dashboard/")

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved !== null) {
      setCollapsed(saved === "true")
    }
  }, [])

  // Save collapsed state to localStorage
  useEffect(() => {
    if (visible) {
      localStorage.setItem("sidebar-collapsed", String(collapsed))
    }
  }, [collapsed, visible])

  // Collapse on tablet widths (≥576 && <768) – auto-collapse for small screens
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width >= 576 && width < 768) {
        setCollapsed(true)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Close mobile overlay on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  if (!visible) return null

  const toggleCollapse = () => setCollapsed((prev) => !prev)

  const renderLinks = (onNavigate?: () => void) => (
    <nav className="space-y-1" role="navigation" aria-label={`${role} navigation`}>
      {links.map((link) => {
        const Icon = iconMap[link.icon] || LayoutDashboard
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-300",
              "hover:bg-sidebar-hover",
              active ? "bg-sidebar-hover text-sidebar-foreground font-medium" : "text-sidebar-foreground/80"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{link.title}</span>}
            {!collapsed && link.badge && (
              <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {link.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile hamburger - only visible on small screens */}
      <button
        className="fixed left-4 z-50 md:hidden p-2 rounded-md bg-muted hover:bg-muted/80 transition-colors duration-300"
        style={{ top: NAVBAR_HEIGHT + 16 }}
        aria-label="Toggle sidebar"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop / Tablet sidebar - fixed positioning */}
      <aside
        className={cn(
          "hidden md:flex flex-col fixed left-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground z-40 transition-all duration-300"
        )}
        style={{
          top: NAVBAR_HEIGHT,
          bottom: 0,
          width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        }}
        data-role={role}
        aria-label={`${role === "admin" ? "Admin" : "User"} Dashboard Sidebar`}
      >
        {/* Header with collapse toggle */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!collapsed && (
            <h3 className="text-sm font-semibold truncate">
              {role === "admin" ? "Admin" : "Dashboard"}
            </h3>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={cn("h-8 w-8 shrink-0", collapsed && "mx-auto")}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderLinks()}
        </div>
      </aside>

      {/* Mobile overlay - slides in from left */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 transition-opacity duration-300"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Sidebar panel - 80% width */}
          <div
            className="absolute left-0 top-0 h-full w-[80vw] max-w-xs overflow-y-auto border-r border-sidebar-border bg-sidebar p-4 transition-transform duration-300"
            role="dialog"
            aria-modal="true"
            aria-label={`${role === "admin" ? "Admin" : "User"} navigation menu`}
          >
            {/* Close button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">
                {role === "admin" ? "Admin Dashboard" : "Dashboard"}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {renderLinks(() => setOpen(false))}
          </div>
        </div>
      )}
    </>
  )
}
