import { DashboardShell, StatCard } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = { title: "Dashboard", description: "User dashboard (mock)" }

export default function DashboardPage() {
  return (
    <DashboardShell title="User Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Membership" value="Active" change="Renewal in 6 months" />
        <StatCard title="Events RSVP'd" value="3" change="+1 this month" />
        <StatCard title="Donations" value="$250" change="Thank you!" />
        <StatCard title="Messages" value="2" change="New notifications" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming events</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Citizen Science Engagement Seminar • Oct 15</li>
              <li>DNA Extraction Workshop • Oct 20</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 rounded-md border bg-muted/40" />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
