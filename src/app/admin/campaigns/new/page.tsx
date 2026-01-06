"use client"

import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { CampaignForm } from "@/components/campaign-form"

export default function NewCampaignPage() {
  return (
    <AdminDashboardShell title="Create Campaign">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
          <p className="mt-1 text-muted-foreground">
            Set up a new fundraising campaign for the organization.
          </p>
        </div>

        <CampaignForm />
      </div>
    </AdminDashboardShell>
  )
}
