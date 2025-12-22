"use client"

import { CampaignForm } from "@/components/campaign-form"

export default function NewCampaignPage() {
  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new fundraising campaign for the organization.
        </p>
      </div>
      
      <CampaignForm />
    </div>
  )
}
