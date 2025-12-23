"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { campaignsApi } from "@/lib/api"
import { CampaignProgress } from "@/components/campaign-progress"
import { CampaignDonateForm } from "@/components/campaign-donate-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Users, Calendar, MapPin, Share2 } from "lucide-react"
import type { DonationCampaign } from "@/schemas/campaign"
import Swal from "sweetalert2"

export default function CampaignDetailPage() {
  const isLocal = process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("localhost") || 
                  process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("127.0.0.1")
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [campaign, setCampaign] = useState<DonationCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await campaignsApi.getBySlug(slug)
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

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign?.title,
          text: campaign?.short_description || "Support this campaign!",
          url,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url)
      Swal.fire({
        icon: "success",
        title: "Link Copied!",
        text: "Campaign link copied to clipboard",
        timer: 2000,
        showConfirmButton: false,
      })
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("en-KE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="container max-w-5xl py-8 space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="container max-w-5xl py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
          <p className="text-muted-foreground mb-8">{error || "This campaign does not exist or is no longer active."}</p>
          <Button asChild>
            <Link href="/donations">View All Campaigns</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isCompleted = campaign.status === "completed"

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/donations">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Donations
        </Link>
      </Button>

      {/* Hero Image */}
      {campaign.hero_image_url && (
        <div className="relative aspect-[21/9] rounded-xl overflow-hidden">
          <Image
            src={campaign.hero_image_url}
            alt={campaign.title}
            fill
            unoptimized={isLocal}
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Status Badge */}
          {(campaign.is_goal_reached || isCompleted) && (
            <div className="absolute top-4 right-4">
              <Badge className="text-sm py-1 px-3" variant={campaign.is_goal_reached ? "default" : "secondary"}>
                {campaign.is_goal_reached ? "🎉 Goal Reached!" : "Completed"}
              </Badge>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{campaign.title}</h1>
            {campaign.short_description && (
              <p className="text-lg text-muted-foreground">{campaign.short_description}</p>
            )}
          </div>

          {/* Progress */}
          <CampaignProgress
            currentAmount={campaign.current_amount}
            goalAmount={campaign.goal_amount}
            currency={campaign.currency}
            className="p-4 bg-muted/30 rounded-lg"
          />

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{campaign.donor_count} donor{campaign.donor_count !== 1 ? "s" : ""}</span>
            </div>
            
            {campaign.county && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{campaign.county.name}</span>
              </div>
            )}

            {campaign.ends_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Ends {formatDate(campaign.ends_at)}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: campaign.description }}
              />
            </CardContent>
          </Card>

          {/* Share Button */}
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Campaign
          </Button>
        </div>

        {/* Sidebar - Donation Form */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>
                {isCompleted ? "Campaign Completed" : "Make a Donation"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCompleted ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    Thank you to everyone who contributed to this campaign!
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/donations">View Other Campaigns</Link>
                  </Button>
                </div>
              ) : (
                <CampaignDonateForm 
                  campaign={campaign}
                  onSuccess={() => {
                    // Refresh campaign data after donation
                    campaignsApi.getBySlug(slug).then(setCampaign)
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
