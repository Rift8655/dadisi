"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import type { DonationCampaign } from "@/schemas/campaign"

import { campaignAdminApi } from "@/lib/api-admin"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { CampaignForm } from "@/components/campaign-form"

export default function EditCampaignPage() {
  const params = useParams()
  const slug = params.slug as string

  const [campaign, setCampaign] = useState<DonationCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await campaignAdminApi.get(slug)
        setCampaign(data)
      } catch (err: any) {
        console.error("Failed to fetch campaign:", err)
        setError(err.message || "Failed to load campaign")
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchCampaign()
    }
  }, [slug])

  if (loading) {
    return (
      <AdminDashboardShell title="Edit Campaign">
        <div className="max-w-3xl space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AdminDashboardShell>
    )
  }

  if (error || !campaign) {
    return (
      <AdminDashboardShell title="Edit Campaign">
        <div className="max-w-3xl">
          <div className="py-16 text-center">
            <h1 className="mb-4 text-2xl font-bold">Campaign Not Found</h1>
            <p className="text-muted-foreground">
              {error || "This campaign does not exist."}
            </p>
          </div>
        </div>
      </AdminDashboardShell>
    )
  }

  return (
    <AdminDashboardShell title="Edit Campaign">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Campaign</h1>
          <p className="mt-1 text-muted-foreground">
            Update the details for "{campaign.title}"
          </p>
        </div>

        <CampaignForm
          initialData={{
            slug: campaign.slug,
            title: campaign.title,
            description: campaign.description,
            short_description: campaign.short_description,
            goal_amount: campaign.goal_amount,
            minimum_amount: campaign.minimum_amount,
            currency: campaign.currency as "KES" | "USD",
            county_id: campaign.county?.id,
            starts_at: campaign.starts_at,
            ends_at: campaign.ends_at,
            status: campaign.status as "draft" | "active",
            featured_media_id: campaign.featured_media?.id,
            featured_media_url:
              campaign.featured_media?.url ||
              campaign.hero_image_url ||
              undefined,
            gallery_media_ids: campaign.media?.map((m) => m.id) || [],
          }}
          isEdit
        />
      </div>
    </AdminDashboardShell>
  )
}
