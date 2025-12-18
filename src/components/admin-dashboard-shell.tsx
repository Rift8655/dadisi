"use client"

import { useState, useEffect } from "react"

import Sidebar from "@/components/Sidebar"

// Constants matching Sidebar component
const SIDEBAR_WIDTH = 250
const SIDEBAR_COLLAPSED_WIDTH = 70

/**
 * AdminDashboardShell – Layout for admin dashboard pages with sidebar.
 * Use this for /admin/* routes.
 */
export function AdminDashboardShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Handle hydration - only read from localStorage after mount
  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved !== null) {
      setCollapsed(saved === "true")
    }
  }, [])

  // Listen for sidebar state changes
  useEffect(() => {
    if (!isMounted) return

    const checkCollapsed = () => {
      const saved = localStorage.getItem("sidebar-collapsed")
      if (saved !== null) {
        setCollapsed(saved === "true")
      }
    }

    // Poll for localStorage changes in same tab
    const interval = setInterval(checkCollapsed, 100)
    window.addEventListener("storage", checkCollapsed)

    return () => {
      clearInterval(interval)
      window.removeEventListener("storage", checkCollapsed)
    }
  }, [isMounted])

  // Calculate margin based on collapsed state (only on md+ screens)
  const sidebarMargin = isMounted ? (collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH) : SIDEBAR_WIDTH

  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <Sidebar role="admin" />

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
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
