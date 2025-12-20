"use client"

import Link from "next/link"
import Image from "next/image"
import { CampaignProgress } from "@/components/campaign-progress"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Calendar, MapPin } from "lucide-react"
import type { DonationCampaign } from "@/schemas/campaign"

interface CampaignCardProps {
  campaign: DonationCampaign
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const isCompleted = campaign.status === "completed"
  const isGoalReached = campaign.is_goal_reached
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("en-KE", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Hero Image */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {campaign.hero_image_url ? (
          <Image
            src={campaign.hero_image_url}
            alt={campaign.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-4xl">🎯</span>
          </div>
        )}
        
        {/* Status Badge */}
        {(isCompleted || isGoalReached) && (
          <div className="absolute top-3 right-3">
            <Badge variant={isGoalReached ? "default" : "secondary"}>
              {isGoalReached ? "Goal Reached! 🎉" : "Completed"}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {campaign.title}
        </h3>
        {campaign.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {campaign.short_description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {/* Progress */}
        <CampaignProgress
          currentAmount={campaign.current_amount}
          goalAmount={campaign.goal_amount}
          currency={campaign.currency}
          showLabels={true}
        />

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{campaign.donor_count} donor{campaign.donor_count !== 1 ? "s" : ""}</span>
          </div>
          
          {campaign.county && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{campaign.county.name}</span>
            </div>
          )}
        </div>

        {/* End Date */}
        {campaign.ends_at && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Ends {formatDate(campaign.ends_at)}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild className="w-full" variant={isCompleted ? "outline" : "default"}>
          <Link href={`/campaigns/${campaign.slug}`}>
            {isCompleted ? "View Campaign" : "Donate Now"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
