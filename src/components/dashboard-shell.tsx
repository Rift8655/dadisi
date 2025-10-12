"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, BarChart2, Table as TableIcon, Settings, Users, X, Menu } from "lucide-react"

export function DashboardShell({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/dashboard/tables", label: "Tables", icon: TableIcon },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 lg:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="hidden border-r lg:block">
        <div className="sticky top-14 h-[calc(100vh-56px)] overflow-y-auto p-4">
          <div className="mb-4 text-sm font-semibold text-muted-foreground">Material Dashboard (mock)</div>
          <nav className="space-y-1">
            {links.map((l) => {
              const Icon = l.icon
              const active = pathname === l.href
              return (
                <Link key={l.href} href={l.href} className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground", active ? "bg-accent text-accent-foreground" : "text-foreground/80")}> 
                  <Icon className="h-4 w-4" />
                  {l.label}
                </Link>
              )
            })}
            <Link href="/admin" className="mt-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground">
              <Users className="h-4 w-4" /> Admin
            </Link>
          </nav>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-14 h-[calc(100vh-56px)] w-72 overflow-y-auto border-r bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Material Dashboard (mock)</span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></Button>
            </div>
            <nav className="space-y-1">
              {links.map((l) => {
                const Icon = l.icon
                const active = pathname === l.href
                return (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground", active ? "bg-accent text-accent-foreground" : "text-foreground/80")}> 
                    <Icon className="h-4 w-4" />
                    {l.label}
                  </Link>
                )
              })}
              <Link href="/admin" onClick={() => setOpen(false)} className="mt-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground">
                <Users className="h-4 w-4" /> Admin
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="min-w-0">
        <div className="flex items-center justify-between border-b px-4 py-3 lg:px-6">
          <h1 className="text-xl font-semibold">{title}</h1>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export function StatCard({ title, value, change, children }: { title: string; value: string; change?: string; children?: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && <div className="text-xs text-muted-foreground">{change}</div>}
        {children}
      </CardContent>
    </Card>
  )
}

export default DashboardShell
