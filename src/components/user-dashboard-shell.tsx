"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import { useSidebarStore } from "@/store/sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

// Constants matching Sidebar component
const SIDEBAR_WIDTH = 250
const SIDEBAR_COLLAPSED_WIDTH = 70

/**
 * UserDashboardShell – Layout for user dashboard pages with sidebar.
 * Use this for /dashboard/* routes.
 */
export function UserDashboardShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const { isCollapsed, setIsOpen } = useSidebarStore()
  const [isMounted, setIsMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Calculate margin based on collapsed state (only on md+ screens)
  const sidebarMargin = isMounted ? (isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH) : SIDEBAR_WIDTH

  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <Sidebar role="user" />

      {/* Main content with margin offset for sidebar on md+ screens */}
      <main
        className="min-w-0 transition-[margin] duration-300"
        style={{
          marginLeft: isMounted ? `${sidebarMargin}px` : undefined,
        }}
      >
        {/* Use CSS class for initial render, inline style takes over after hydration */}
        <style jsx>{`
          @media (min-width: 768px) {
            main {
              margin-left: ${sidebarMargin}px;
            }
          }
          @media (max-width: 767px) {
            main {
              margin-left: 0 !important;
            }
          }
        `}</style>
        <div className="flex items-center justify-between border-b px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
