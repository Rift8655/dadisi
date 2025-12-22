"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useLabSpaces, useLabQuota, LAB_SPACE_TYPES } from "@/hooks/useLabBookings"
import { useAuth } from "@/store/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  FlaskConical, 
  Monitor, 
  Leaf, 
  Truck,
  Users,
  Search,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import type { LabSpace, LabSpaceType } from "@/types/lab"

const SPACE_ICONS: Record<LabSpaceType, React.ReactNode> = {
  wet_lab: <FlaskConical className="h-6 w-6" />,
  dry_lab: <Monitor className="h-6 w-6" />,
  greenhouse: <Leaf className="h-6 w-6" />,
  mobile_lab: <Truck className="h-6 w-6" />,
}

const SPACE_COLORS: Record<LabSpaceType, string> = {
  wet_lab: "from-blue-500 to-cyan-500",
  dry_lab: "from-purple-500 to-indigo-500",
  greenhouse: "from-green-500 to-emerald-500",
  mobile_lab: "from-orange-500 to-amber-500",
}

export default function LabSpacesPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const { isAuthenticated } = useAuth()

  // Fetch lab spaces
  const { data: spaces, isLoading, error } = useLabSpaces({
    type: typeFilter !== "all" ? typeFilter : undefined,
    search: search || undefined,
  })

  // Fetch quota (only if authenticated)
  const { data: quota } = useLabQuota()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Lab Spaces
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Book state-of-the-art laboratory spaces for your research, experiments, 
              and innovation projects. From wet labs to mobile units, we have the facilities you need.
            </p>

            {/* Quota Status (if authenticated) */}
            {isAuthenticated && quota && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border shadow-sm">
                {quota.has_access ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">
                      {quota.unlimited ? (
                        <>Unlimited Lab Access</>
                      ) : (
                        <>{quota.remaining}h remaining of {quota.limit}h this month</>
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">
                      Upgrade your plan for lab access
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="container mx-auto px-4 -mt-8 mb-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search lab spaces..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Type Filter */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {LAB_SPACE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Lab Spaces Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-medium mb-2">Failed to load lab spaces</h3>
              <p className="text-muted-foreground">Please try again later.</p>
            </Card>
          ) : spaces && spaces.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {spaces.map((space) => (
                <LabSpaceCard key={space.id} space={space} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No lab spaces found</h3>
              <p className="text-muted-foreground">
                {search ? "Try a different search term." : "Check back later for available spaces."}
              </p>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}

// Lab Space Card Component
function LabSpaceCard({ space }: { space: LabSpace }) {
  const icon = SPACE_ICONS[space.type]
  const gradient = SPACE_COLORS[space.type]

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
      {/* Header with gradient */}
      <div className={`relative h-32 bg-gradient-to-r ${gradient}`}>
        {space.image_url ? (
          <Image
            src={space.image_url}
            alt={space.name}
            fill
            className="object-cover opacity-40"
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm">
            {icon}
          </div>
        </div>
        <Badge 
          variant="secondary" 
          className="absolute top-4 right-4 bg-white/90 text-foreground"
        >
          {space.type_name}
        </Badge>
      </div>

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{space.name}</span>
          <div className="flex items-center gap-1 text-sm text-muted-foreground font-normal">
            <Users className="h-4 w-4" />
            <span>{space.capacity}</span>
          </div>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {space.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amenities preview */}
        {space.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {space.amenities.slice(0, 4).map((amenity, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {space.amenities.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{space.amenities.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {space.hourly_rate > 0 ? (
                `KES ${space.hourly_rate}/hr`
              ) : (
                <span className="text-green-600 font-medium">Free with subscription</span>
              )}
            </span>
          </div>
          <Button asChild>
            <Link href={`/spaces/${space.slug}`}>
              View & Book
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
