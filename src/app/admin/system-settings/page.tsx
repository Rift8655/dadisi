"use client"

import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Settings, 
  CreditCard, 
  Webhook, 
  Clock, 
  DollarSign,
  Shield,
  MapPin,
  ChevronRight
} from "lucide-react"

const settingsSections = [
  {
    title: "Payment Gateway Settings",
    description: "Configure Pesapal API keys, environment, and testing utilities.",
    icon: CreditCard,
    href: "/admin/payment-gateway-settings",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/10"
  },
  {
    title: "Retention Settings",
    description: "Manage how long user data and records are stored before automatic cleanup.",
    icon: Clock,
    href: "/admin/retention-settings",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/10"
  },
  {
    title: "Webhooks",
    description: "Monitor and configure external system notifications and endpoints.",
    icon: Webhook,
    href: "/admin/webhooks",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/10"
  },
  {
    title: "Exchange Rates",
    description: "Configure KES to USD conversion rates and manual overrides.",
    icon: DollarSign,
    href: "/admin/exchange-rates",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/10"
  },
  {
    title: "Counties Management",
    description: "Manage the list of counties and their respective codes for reporting.",
    icon: MapPin,
    href: "/admin/counties",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/10"
  },
  {
    title: "Audit Logs",
    description: "Review system access logs and administrative changes.",
    icon: Shield,
    href: "/admin/audit-logs",
    color: "text-gray-500",
    bgColor: "bg-gray-50 dark:bg-gray-900/10"
  }
]

export default function AdminSystemSettingsPage() {
  return (
    <AdminDashboardShell title="System Settings Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsSections.map((section) => (
            <Card key={section.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-2 rounded-lg ${section.bgColor}`}>
                  <section.icon className={`h-6 w-6 ${section.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="min-h-[40px]">
                  {section.description}
                </CardDescription>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href={section.href}>
                    Manage Settings
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">About System Settings</CardTitle>
            <CardDescription>
              This dashboard provides quick access to various administrative configuration modules. 
              Changes made in these modules may affect application behavior immediately.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </AdminDashboardShell>
  )
}
