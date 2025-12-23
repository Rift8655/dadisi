"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  MessageSquare,
  FileText,
  Briefcase,
  Heart,
  Mail,
  Lock,
} from "lucide-react"
import { publicProfileApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function PublicProfilePage() {
  const params = useParams()
  const username = params.username as string

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: () => publicProfileApi.get(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const profile = data?.data

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/forum/users">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Members
        </Link>
      </Button>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-3 text-center sm:text-left flex-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error/Private State */}
      {error && (
        <Card className="border-muted">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Profile Not Available</h2>
            <p className="text-muted-foreground mb-6">
              This profile is private or the user doesn't exist.
            </p>
            <Button asChild variant="outline">
              <Link href="/forum/users">Browse Members</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Profile Content */}
      {!isLoading && !error && profile && (
        <div className="space-y-6">
          {/* Header Card */}
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profile.profile_picture_url || "/images/default-avatar.png"} />
                  <AvatarFallback className="bg-primary/5 text-primary text-2xl">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>

                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-3xl font-bold">{profile.username}</h1>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-muted-foreground">
                    {profile.joined_at && (
                      <span className="flex items-center gap-1.5 text-sm">
                        <Calendar className="h-4 w-4" />
                        Joined {formatDistanceToNow(new Date(profile.joined_at), { addSuffix: true })}
                      </span>
                    )}
                    {profile.location && (
                      <span className="flex items-center gap-1.5 text-sm">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </span>
                    )}
                    {profile.occupation && (
                      <span className="flex items-center gap-1.5 text-sm">
                        <Briefcase className="h-4 w-4" />
                        {profile.occupation}
                      </span>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="mt-4 text-muted-foreground">{profile.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          {(profile.thread_count !== undefined || profile.post_count !== undefined) && (
            <div className="grid grid-cols-2 gap-4">
              {profile.thread_count !== undefined && (
                <Card>
                  <CardContent className="py-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-3xl font-bold">{profile.thread_count}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Threads Started</p>
                  </CardContent>
                </Card>
              )}
              {profile.post_count !== undefined && (
                <Card>
                  <CardContent className="py-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <span className="text-3xl font-bold">{profile.post_count}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Forum Posts</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Interests
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact */}
          {profile.email && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <a 
                  href={`mailto:${profile.email}`} 
                  className="text-primary hover:underline"
                >
                  {profile.email}
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
