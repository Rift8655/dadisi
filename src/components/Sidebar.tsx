"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/store/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { ChevronLeft, ChevronRight, ChevronDown, Menu, X } from "lucide-react"

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
  Folder,
  Tag,
  Target,
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
  folder: Folder,
  tag: Tag,
  target: Target,
}

interface LinkItem {
  title: string
  href?: string
  icon: string
  badge?: string | null
  children?: LinkItem[]
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Load link data based on role
  const links: LinkItem[] = role === "admin" ? adminLinks : userLinks

  // Determine if we are on a dashboard route for this role
  const visible = role === "admin"
    ? pathname === "/admin" || pathname.startsWith("/admin/")
    : pathname === "/dashboard" || pathname.startsWith("/dashboard/")

  // Auto-expand groups that contain the current route
  useEffect(() => {
    const newExpanded = new Set<string>()
    links.forEach((link) => {
      if (link.children) {
        const hasActiveChild = link.children.some(
          (child) => child.href && pathname.startsWith(child.href)
        )
        if (hasActiveChild) {
          newExpanded.add(link.title)
        }
      }
    })
    if (newExpanded.size > 0) {
      setExpandedGroups((prev) => new Set([...prev, ...newExpanded]))
    }
  }, [pathname, links])

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

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }

  const renderLink = (link: LinkItem, onNavigate?: () => void, isChild = false) => {
    const Icon = iconMap[link.icon] || LayoutDashboard
    const active = link.href ? pathname === link.href : false

    return (
      <Link
        key={link.href}
        href={link.href || "#"}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-300",
          "hover:bg-sidebar-hover",
          active ? "bg-sidebar-hover text-sidebar-foreground font-medium" : "text-sidebar-foreground/80",
          isChild && !collapsed && "pl-8"
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
  }

  const renderGroupOrLink = (link: LinkItem, onNavigate?: () => void) => {
    // If it has children, render as collapsible group
    if (link.children && link.children.length > 0) {
      const Icon = iconMap[link.icon] || LayoutDashboard
      const isExpanded = expandedGroups.has(link.title)
      const hasActiveChild = link.children.some(
        (child) => child.href && pathname.startsWith(child.href)
      )

      return (
        <div key={link.title} className="space-y-1">
          {/* Group header button */}
          <button
            onClick={() => toggleGroup(link.title)}
            className={cn(
              "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-300",
              "hover:bg-sidebar-hover",
              hasActiveChild ? "text-sidebar-foreground font-medium" : "text-sidebar-foreground/80"
            )}
            aria-expanded={isExpanded}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="truncate flex-1 text-left">{link.title}</span>
                {link.badge && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-300",
                    isExpanded && "rotate-180"
                  )}
                />
              </>
            )}
          </button>
          {/* Children - animate height */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              isExpanded && !collapsed ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="space-y-1 py-1">
              {link.children.map((child) => renderLink(child, onNavigate, true))}
            </div>
          </div>
        </div>
      )
    }

    // Regular link without children
    return renderLink(link, onNavigate)
  }

  const renderLinks = (onNavigate?: () => void) => (
    <nav className="space-y-1" role="navigation" aria-label={`${role} navigation`}>
      {links.map((link) => renderGroupOrLink(link, onNavigate))}
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

        {/* Footer with Theme Toggle */}
        <div className="p-4 border-t border-sidebar-border flex items-center justify-between">
          {!collapsed && <span className="text-xs text-muted-foreground">Theme</span>}
          <div className={cn(collapsed && "mx-auto")}>
            <ModeToggle />
          </div>
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
            <div className="mt-auto pt-4 border-t border-sidebar-border flex items-center justify-between">
              <span className="text-sm font-medium">Theme</span>
              <ModeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
