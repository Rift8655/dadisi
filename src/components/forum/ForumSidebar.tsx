"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FolderOpen,
  Clock,
  Tag,
  Users,
  Globe,
  ScrollText,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { useGroups } from "@/hooks/useGroups"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface ForumSidebarProps {
  className?: string
}

export function ForumSidebar({ className }: ForumSidebarProps) {
  const pathname = usePathname()
  const [countyExpanded, setCountyExpanded] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by waiting for client mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch county groups using the hook
  const { data: groupsData, isLoading: groupsLoading } = useGroups({ per_page: 10 })
  const groups = groupsData?.data ?? []

  // Navigation items
  const navItems = [
    { href: "/forum", icon: FolderOpen, label: "Categories" },
    { href: "/forum/recent", icon: Clock, label: "Recent" },
    { href: "/forum/tags", icon: Tag, label: "Tags" },
    { href: "/forum/users", icon: Users, label: "Users" },
    { href: "/forum/rules", icon: ScrollText, label: "Rules" },
  ]

  return (
    <aside className={cn("w-64 shrink-0 space-y-6", className)}>
      {/* Main Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = mounted && pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="border-t" />

      {/* County Hub Section */}
      <div className="space-y-2">
        <button
          onClick={() => setCountyExpanded(!countyExpanded)}
          className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg"
        >
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            COUNTY HUB
          </span>
          {countyExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {countyExpanded && (
          <div className="space-y-1 pl-2">
            {/* Loading state - show on server and while loading on client */}
            {(!mounted || groupsLoading) && (
              <>
                <Skeleton className="h-7 w-full rounded-lg" />
                <Skeleton className="h-7 w-full rounded-lg" />
                <Skeleton className="h-7 w-full rounded-lg" />
              </>
            )}
            
            {/* Groups list - only render when mounted and loaded to avoid hydration mismatch */}
            {mounted && !groupsLoading && groups.slice(0, 5).map((group) => {
              const href = `/forum/county/${group.slug}`
              const isActive = pathname === href
              return (
                <Link
                  key={group.id}
                  href={href}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>{group.county?.name || group.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({group.member_count})
                  </span>
                </Link>
              )
            })}
            
            {mounted && !groupsLoading && groups.length > 5 && (
              <Link
                href="/forum/groups"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:underline"
              >
                View All →
              </Link>
            )}
            
            {mounted && !groupsLoading && groups.length === 0 && (
              <p className="px-3 py-1.5 text-xs text-muted-foreground">
                No county groups yet
              </p>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
