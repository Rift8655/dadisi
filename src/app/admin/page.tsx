import { DashboardShell, StatCard } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = { title: "Admin", description: "Admin dashboard (mock)" }

export default function AdminPage() {
  return (
    <DashboardShell title="Admin / Staff Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Users" value="1,245" change="+32 this week" />
        <StatCard title="Events" value="12" change="3 upcoming" />
        <StatCard title="Memberships" value="418" change="+5 today" />
        <StatCard title="Donations" value="$12.5k" change="+8% MoM" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-x-2">
            <span className="inline-block rounded-md bg-accent px-3 py-1 text-sm">New event</span>
            <span className="inline-block rounded-md bg-accent px-3 py-1 text-sm">Invite user</span>
            <span className="inline-block rounded-md bg-accent px-3 py-1 text-sm">Post update</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 rounded-md border bg-muted/40" />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
