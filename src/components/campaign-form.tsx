"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { campaignAdminApi } from "@/lib/api-admin"
import { CreateCampaignSchema, type CreateCampaignInput } from "@/schemas/campaign"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Swal from "sweetalert2"

interface County {
  id: number
  name: string
}

interface CampaignFormProps {
  initialData?: Partial<CreateCampaignInput> & { slug?: string }
  isEdit?: boolean
}

export function CampaignForm({ initialData, isEdit = false }: CampaignFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCampaignInput>({
    resolver: zodResolver(CreateCampaignSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      short_description: initialData?.short_description || "",
      goal_amount: initialData?.goal_amount || undefined,
      minimum_amount: initialData?.minimum_amount || undefined,
      currency: initialData?.currency || "KES",
      county_id: initialData?.county_id || undefined,
      starts_at: initialData?.starts_at || "",
      ends_at: initialData?.ends_at || "",
      status: initialData?.status || "draft",
    },
  })

  const { data: counties = [], isLoading: loadingMetadata } = useQuery({
    queryKey: ["campaign-metadata"],
    queryFn: async () => {
      const response = await campaignAdminApi.getCreateMetadata()
      return (response.data?.counties || []) as County[]
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: CreateCampaignInput) => {
      if (isEdit && initialData?.slug) {
        return campaignAdminApi.update(initialData.slug, data)
      } else {
        return campaignAdminApi.create(data)
      }
    },
    onSuccess: (_: any, variables: CreateCampaignInput) => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] })
      Swal.fire({
        icon: "success",
        title: isEdit ? "Campaign Updated!" : "Campaign Created!",
        text: !isEdit && variables.status === "active" ? "Your campaign is now live!" : (!isEdit ? "Campaign saved as draft." : undefined),
        timer: 1500,
        showConfirmButton: false,
      })
      router.push("/admin/campaigns")
    },
    onError: (error: any) => {
      console.error("Campaign save failed:", error)
      Swal.fire("Error", error.message || "Failed to save campaign", "error")
    }
  })

  const watchedCurrency = watch("currency")
  const watchedStatus = watch("status")

  const onSubmit = (data: CreateCampaignInput) => {
    mutation.mutate(data)
  }

  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Basic information about your fundraising campaign.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g., Education Fund 2025"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Short Description</Label>
            <Textarea
              id="short_description"
              {...register("short_description")}
              placeholder="Brief summary for campaign cards (max 500 characters)"
              rows={2}
            />
            {errors.short_description && (
              <p className="text-sm text-destructive">{errors.short_description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Detailed campaign description. You can use HTML for formatting."
              rows={8}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Funding */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Goals</CardTitle>
          <CardDescription>
            Set your fundraising target and minimum donation amount.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={watchedCurrency}
                onValueChange={(value) => setValue("currency", value as "KES" | "USD")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES (Kenya Shilling)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal_amount">Goal Amount (optional)</Label>
              <Input
                id="goal_amount"
                type="number"
                {...register("goal_amount", { valueAsNumber: true })}
                placeholder="e.g., 100000"
                min={0}
              />
              <p className="text-xs text-muted-foreground">Leave empty for unlimited goal</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_amount">Minimum Donation (optional)</Label>
              <Input
                id="minimum_amount"
                type="number"
                {...register("minimum_amount", { valueAsNumber: true })}
                placeholder="e.g., 100"
                min={0}
              />
              <p className="text-xs text-muted-foreground">Bypassed in dev/staging</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule & Location */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule & Location</CardTitle>
          <CardDescription>
            Set optional start/end dates and associate with a county.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Start Date (optional)</Label>
              <Input
                id="starts_at"
                type="date"
                {...register("starts_at")}
                defaultValue={formatDateForInput(initialData?.starts_at)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ends_at">End Date (optional)</Label>
              <Input
                id="ends_at"
                type="date"
                {...register("ends_at")}
                defaultValue={formatDateForInput(initialData?.ends_at)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="county_id">County (optional)</Label>
              <Select
                value={watch("county_id")?.toString() || ""}
                onValueChange={(value) => setValue("county_id", value ? parseInt(value) : undefined)}
                disabled={loadingMetadata}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {counties.map((county: County) => (
                    <SelectItem key={county.id} value={county.id.toString()}>
                      {county.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status & Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={watchedStatus}
              onValueChange={(value) => setValue("status", value as "draft" | "active")}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft (not visible)</SelectItem>
                <SelectItem value="active">Active (visible to public)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEdit ? "Update Campaign" : "Create Campaign"}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/campaigns">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
