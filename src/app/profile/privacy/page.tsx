"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  User,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  Heart,
  Briefcase,
  Save,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { publicProfileApi, type PrivacySettings } from "@/lib/api"
import { useAuth } from "@/store/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function PrivacySettingsPage() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const [settings, setSettings] = useState<PrivacySettings>({
    public_profile_enabled: true,
    public_bio: null,
    show_email: false,
    show_location: true,
    show_join_date: true,
    show_post_count: true,
    show_interests: true,
    show_occupation: false,
  })

  const { data, isLoading } = useQuery({
    queryKey: ["privacy-settings"],
    queryFn: () => publicProfileApi.getPrivacySettings(),
    enabled: isAuthenticated,
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<PrivacySettings>) => publicProfileApi.updatePrivacySettings(data),
    onSuccess: () => {
      toast.success("Privacy settings saved!")
      queryClient.invalidateQueries({ queryKey: ["privacy-settings"] })
      queryClient.invalidateQueries({ queryKey: ["profile-preview"] })
    },
    onError: () => {
      toast.error("Failed to save settings")
    },
  })

  useEffect(() => {
    if (data?.data) {
      setSettings(data.data)
    }
  }, [data])

  const handleToggle = (key: keyof PrivacySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    updateMutation.mutate(settings)
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">Please sign in to manage your privacy settings.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/profile">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Profile
        </Link>
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Privacy Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Control what information is visible on your public profile.
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Main Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {settings.public_profile_enabled ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  Public Profile
                </CardTitle>
                <CardDescription>
                  When enabled, other members can view your profile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="public_profile_enabled" className="text-base">
                    Enable public profile
                  </Label>
                  <Switch
                    id="public_profile_enabled"
                    checked={settings.public_profile_enabled}
                    onCheckedChange={(v) => handleToggle("public_profile_enabled", v)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Public Bio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Public Bio
                </CardTitle>
                <CardDescription>
                  A short bio visible to other members. Different from your private profile bio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Tell others a bit about yourself..."
                  value={settings.public_bio || ""}
                  onChange={(e) => setSettings(prev => ({ ...prev, public_bio: e.target.value }))}
                  maxLength={500}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  {(settings.public_bio || "").length}/500
                </p>
              </CardContent>
            </Card>

            {/* Visibility Toggles */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Visibility</CardTitle>
                <CardDescription>
                  Choose which information to display on your public profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="show_email">Email address</Label>
                  </div>
                  <Switch
                    id="show_email"
                    checked={settings.show_email}
                    onCheckedChange={(v) => handleToggle("show_email", v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="show_location">Location (County)</Label>
                  </div>
                  <Switch
                    id="show_location"
                    checked={settings.show_location}
                    onCheckedChange={(v) => handleToggle("show_location", v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="show_join_date">Join date</Label>
                  </div>
                  <Switch
                    id="show_join_date"
                    checked={settings.show_join_date}
                    onCheckedChange={(v) => handleToggle("show_join_date", v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="show_post_count">Forum activity stats</Label>
                  </div>
                  <Switch
                    id="show_post_count"
                    checked={settings.show_post_count}
                    onCheckedChange={(v) => handleToggle("show_post_count", v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="show_interests">Interests</Label>
                  </div>
                  <Switch
                    id="show_interests"
                    checked={settings.show_interests}
                    onCheckedChange={(v) => handleToggle("show_interests", v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="show_occupation">Occupation</Label>
                  </div>
                  <Switch
                    id="show_occupation"
                    checked={settings.show_occupation}
                    onCheckedChange={(v) => handleToggle("show_occupation", v)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button variant="outline" asChild>
                <Link href={user?.username ? `/users/${user.username}` : "#"} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview Public Profile
                </Link>
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
