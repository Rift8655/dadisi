import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
// Import link data
import adminLinks from "@/data/adminSidebarLinks.json"
import userLinks from "@/data/userSidebarLinks.json"
import { useAuth } from "@/store/auth"
import { useSidebarStore } from "@/store/sidebar"
// Icon mapping – matches keys used in the JSON link files
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  FileText,
  FlaskConical,
  Folder,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageCircle,
  Settings,
  Shield,
  Tag,
  Target,
  Users,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
/* ... rest of imports ... */
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

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
  "map-pin": MapPin,
  flask: FlaskConical,
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

// Constants for layout dimensions
const SIDEBAR_WIDTH = 250
const SIDEBAR_COLLAPSED_WIDTH = 70
const NAVBAR_HEIGHT = 56 // h-14 = 3.5rem = 56px

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const { adminAccess } = useAuth()
  const { isOpen, isCollapsed, setIsOpen, setIsCollapsed, toggleCollapsed } =
    useSidebarStore()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Load link data based on role
  const links: LinkItem[] = role === "admin" ? adminLinks : userLinks

  // Determine if we are on a dashboard route for this role
  const visible =
    role === "admin"
      ? pathname === "/admin" || pathname.startsWith("/admin/")
      : pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/") ||
        pathname === "/profile" ||
        pathname.startsWith("/profile/")

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

  // Collapse on tablet widths (≥576 && <768) – auto-collapse for small screens
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width >= 576 && width < 768) {
        setIsCollapsed(true)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [setIsCollapsed])

  // Close mobile overlay on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname, setIsOpen])

  if (!visible) return null

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

  const renderLink = (
    link: LinkItem,
    onNavigate?: () => void,
    isChild = false,
    forceShowText = false
  ) => {
    const Icon = iconMap[link.icon] || LayoutDashboard
    const active = link.href ? pathname === link.href : false
    const showText = !isCollapsed || forceShowText

    return (
      <Link
        key={link.href}
        href={link.href || "#"}
        onClick={onNavigate}
        className={cn(
          "flex items-center rounded-md text-sm transition-colors duration-300",
          showText ? "gap-2 px-3 py-2" : "justify-center py-2",
          "hover:bg-sidebar-hover",
          active
            ? "bg-sidebar-hover font-medium text-sidebar-foreground"
            : "text-sidebar-foreground/80",
          isChild && showText && "pl-8"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {showText && <span className="truncate">{link.title}</span>}
        {showText && link.badge && (
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
            {link.badge}
          </span>
        )}
      </Link>
    )
  }

  const renderGroupOrLink = (
    link: LinkItem,
    onNavigate?: () => void,
    forceShowText = false
  ) => {
    // If it has children, render as collapsible group
    if (link.children && link.children.length > 0) {
      const Icon = iconMap[link.icon] || LayoutDashboard
      const isExpanded = expandedGroups.has(link.title)
      const hasActiveChild = link.children.some(
        (child) => child.href && pathname.startsWith(child.href)
      )
      const showText = !isCollapsed || forceShowText

      // When collapsed (and not in mobile overlay), link to first child instead of toggling
      if (!showText) {
        const firstChildHref = link.children[0].href || "#"
        return (
          <Link
            key={link.title}
            href={firstChildHref}
            onClick={onNavigate}
            title={link.title}
            className={cn(
              "flex items-center justify-center rounded-md py-2 text-sm transition-colors duration-300",
              "hover:bg-sidebar-hover",
              hasActiveChild
                ? "bg-sidebar-hover font-medium text-sidebar-foreground"
                : "text-sidebar-foreground/80"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
          </Link>
        )
      }

      return (
        <div key={link.title} className="space-y-1">
          {/* Group header button */}
          <button
            onClick={() => toggleGroup(link.title)}
            className={cn(
              "flex w-full items-center rounded-md text-sm transition-colors duration-300",
              showText ? "gap-2 px-3 py-2" : "justify-center py-2",
              "hover:bg-sidebar-hover",
              hasActiveChild
                ? "font-medium text-sidebar-foreground"
                : "text-sidebar-foreground/80"
            )}
            aria-expanded={isExpanded}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {showText && (
              <>
                <span className="flex-1 truncate text-left">{link.title}</span>
                {link.badge && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
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
              isExpanded && showText
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0"
            )}
          >
            <div className="space-y-1 py-1">
              {link.children.map((child) =>
                renderLink(child, onNavigate, true, forceShowText)
              )}
            </div>
          </div>
        </div>
      )
    }

    // Regular link without children
    return renderLink(link, onNavigate, false, forceShowText)
  }

  const renderLinks = (onNavigate?: () => void, forceShowText = false) => (
    <nav
      className="space-y-1"
      role="navigation"
      aria-label={`${role} navigation`}
    >
      {links.map((link) => renderGroupOrLink(link, onNavigate, forceShowText))}
    </nav>
  )

  return (
    <>
      {/* Desktop / Tablet sidebar - fixed positioning */}
      <aside
        className={cn(
          "fixed left-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 md:flex"
        )}
        style={{
          top: NAVBAR_HEIGHT,
          bottom: 0,
          width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        }}
        data-role={role}
        aria-label={`${role === "admin" ? "Admin" : "User"} Dashboard Sidebar`}
      >
        {/* Header with collapse toggle */}
        <div
          className={cn(
            "flex items-center border-b border-sidebar-border",
            isCollapsed ? "justify-center p-2" : "justify-between p-4"
          )}
        >
          {!isCollapsed && (
            <h3 className="truncate text-sm font-semibold">
              {role === "admin" ? "Admin" : "Dashboard"}
            </h3>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            className="h-8 w-8 shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation links */}
        <div
          className={cn("flex-1 overflow-y-auto", isCollapsed ? "p-2" : "p-4")}
        >
          {renderLinks()}
        </div>

        {/* Footer with Theme Toggle */}
        <div
          className={cn(
            "flex items-center border-t border-sidebar-border",
            isCollapsed ? "justify-center p-2" : "justify-between p-4"
          )}
        >
          {!isCollapsed && (
            <span className="text-xs text-muted-foreground">Theme</span>
          )}
          <div>
            <ModeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile overlay - slides in from left */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
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
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {role === "admin" ? "Admin Dashboard" : "Dashboard"}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {renderLinks(() => setIsOpen(false), true)}
            <div className="mt-auto flex items-center justify-between border-t border-sidebar-border pt-4">
              <span className="text-sm font-medium">Theme</span>
              <ModeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
