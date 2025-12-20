"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import {
  Calendar,
  MapPin,
  Globe,
  Plus,
  Trash2,
  Users,
  DollarSign,
  Loader2,
  Image as ImageIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CreateEventSchema, CreateEventInput, TicketInput, SpeakerInput } from "@/schemas/event-form"
import { eventsApi } from "@/lib/api"
import { api } from "@/lib/api"
import Swal from "sweetalert2"
import type { Event, EventCategory, EventTag, County } from "@/types"

interface EventFormProps {
  initialData?: Event
  isEdit?: boolean
}

export function EventForm({ initialData, isEdit = false }: EventFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category_id: initialData?.category?.id || 0,
      starts_at: initialData?.starts_at ? format(new Date(initialData.starts_at), "yyyy-MM-dd'T'HH:mm") : "",
      ends_at: initialData?.ends_at ? format(new Date(initialData.ends_at), "yyyy-MM-dd'T'HH:mm") : "",
      registration_deadline: initialData?.registration_deadline
        ? format(new Date(initialData.registration_deadline), "yyyy-MM-dd'T'HH:mm")
        : "",
      is_online: initialData?.is_online || false,
      venue: initialData?.venue || "",
      online_link: initialData?.online_link || "",
      county_id: initialData?.county?.id || undefined,
      capacity: initialData?.capacity || undefined,
      waitlist_enabled: initialData?.waitlist_enabled || false,
      waitlist_capacity: initialData?.waitlist_capacity || undefined,
      price: initialData?.price || 0,
      currency: initialData?.currency || "KES",
      status: (initialData?.status as "draft" | "published") || "draft",
      tag_ids: initialData?.tags?.map((t) => t.id) || [],
      tickets: initialData?.tickets?.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description || "",
        price: Number(t.price),
        quantity: t.quantity,
        is_active: t.is_active,
      })) || [],
      speakers: initialData?.speakers?.map((s) => ({
        id: s.id,
        name: s.name,
        designation: s.designation || "",
        company: s.company || "",
        bio: s.bio || "",
        is_featured: s.is_featured,
      })) || [],
    },
  })

  // Metadata queries
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["event-categories"],
    queryFn: () => api.get<{ data: EventCategory[] }>("/api/event-categories").then(res => res.data || res as any),
  })

  const { data: tags = [], isLoading: loadingTags } = useQuery({
    queryKey: ["event-tags"],
    queryFn: () => api.get<{ data: EventTag[] }>("/api/event-tags").then(res => res.data || res as any),
  })

  const { data: counties = [], isLoading: loadingCounties } = useQuery({
    queryKey: ["counties"],
    queryFn: () => api.get<{ data: County[] }>("/api/counties").then(res => res.data || res as any),
  })

  const loadingMetadata = loadingCategories || loadingTags || loadingCounties

  const mutation = useMutation({
    mutationFn: async (data: CreateEventInput) => {
      if (isEdit && initialData?.id) {
        return eventsApi.update(initialData.id, data as any)
      } else {
        return eventsApi.create(data as any)
      }
    },
    onSuccess: (_: any, variables: CreateEventInput) => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] })
      Swal.fire({
        icon: "success",
        title: isEdit ? "Event Updated!" : "Event Created!",
        text: !isEdit && variables.status === "published" ? "Your event is now live!" : (!isEdit ? "Event saved as draft." : undefined),
        timer: 1500,
        showConfirmButton: false,
      })
      router.push("/dashboard/organizer/events")
    },
    onError: (error: any) => {
      console.error("Event save failed:", error)
      Swal.fire("Error", error.message || "Failed to save event", "error")
    }
  })

  const { fields: ticketFields, append: addTicket, remove: removeTicket } = useFieldArray({
    control,
    name: "tickets",
  })

  const { fields: speakerFields, append: addSpeaker, remove: removeSpeaker } = useFieldArray({
    control,
    name: "speakers",
  })

  const isOnline = watch("is_online")
  const selectedTagIds = watch("tag_ids") || []

  const toggleTag = (tagId: number) => {
    const current = selectedTagIds
    if (current.includes(tagId)) {
      setValue("tag_ids", current.filter((id) => id !== tagId))
    } else {
      setValue("tag_ids", [...current, tagId])
    }
  }

  const onSubmit = (data: CreateEventInput) => {
    mutation.mutate(data)
  }

  if (loadingMetadata) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>Enter the essential details about your event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter event title"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your event..."
              rows={5}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Category *</Label>
            <Select
              value={watch("category_id")?.toString() || ""}
              onValueChange={(v) => setValue("category_id", parseInt(v))}
            >
              <SelectTrigger className={errors.category_id ? "border-destructive" : ""}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat: EventCategory) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-sm text-destructive">{errors.category_id.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Start Date & Time *</Label>
              <Input
                id="starts_at"
                type="datetime-local"
                {...register("starts_at")}
                className={errors.starts_at ? "border-destructive" : ""}
              />
              {errors.starts_at && <p className="text-sm text-destructive">{errors.starts_at.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ends_at">End Date & Time</Label>
              <Input id="ends_at" type="datetime-local" {...register("ends_at")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration_deadline">Registration Deadline</Label>
            <Input id="registration_deadline" type="datetime-local" {...register("registration_deadline")} />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
          <CardDescription>Choose whether your event is in-person or online.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Switch
              id="is_online"
              checked={isOnline}
              onCheckedChange={(checked) => setValue("is_online", checked)}
            />
            <Label htmlFor="is_online" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              This is an online/virtual event
            </Label>
          </div>

          {isOnline ? (
            <div className="space-y-2">
              <Label htmlFor="online_link">Online Meeting Link *</Label>
              <Input
                id="online_link"
                {...register("online_link")}
                placeholder="https://zoom.us/j/..."
                className={errors.online_link ? "border-destructive" : ""}
              />
              {errors.online_link && <p className="text-sm text-destructive">{errors.online_link.message}</p>}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Input
                  id="venue"
                  {...register("venue")}
                  placeholder="Event venue address"
                  className={errors.venue ? "border-destructive" : ""}
                />
                {errors.venue && <p className="text-sm text-destructive">{errors.venue.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="county_id">County *</Label>
                <Select
                  value={watch("county_id")?.toString() || ""}
                  onValueChange={(v) => setValue("county_id", parseInt(v))}
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Capacity & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Capacity & Pricing
          </CardTitle>
          <CardDescription>Set capacity limits and ticket pricing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" {...register("capacity")} placeholder="Leave empty for unlimited" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Base Price</Label>
              <Input id="price" type="number" step="0.01" {...register("price")} placeholder="0 for free" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={watch("currency")} onValueChange={(v) => setValue("currency", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="waitlist_enabled"
              checked={watch("waitlist_enabled")}
              onCheckedChange={(checked) => setValue("waitlist_enabled", checked)}
            />
            <Label htmlFor="waitlist_enabled">Enable waitlist when capacity is reached</Label>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>Select tags that describe your event.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: EventTag) => (
              <Badge
                key={tag.id}
                variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => toggleTag(tag.id)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Ticket Tiers
          </CardTitle>
          <CardDescription>Add different ticket types for your event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticketFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Ticket #{index + 1}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeTicket(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <Label>Name</Label>
                  <Input {...register(`tickets.${index}.name`)} placeholder="e.g. Early Bird" />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input type="number" step="0.01" {...register(`tickets.${index}.price`)} />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" {...register(`tickets.${index}.quantity`)} />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => addTicket({ name: "", price: 0, quantity: 50, is_active: true })}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Ticket Tier
          </Button>
        </CardContent>
      </Card>

      {/* Speakers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Speakers
          </CardTitle>
          <CardDescription>Add speakers or presenters for your event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {speakerFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Speaker #{index + 1}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeSpeaker(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input {...register(`speakers.${index}.name`)} placeholder="Speaker name" />
                </div>
                <div>
                  <Label>Designation</Label>
                  <Input {...register(`speakers.${index}.designation`)} placeholder="e.g. CEO" />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input {...register(`speakers.${index}.company`)} placeholder="Company name" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={watch(`speakers.${index}.is_featured`)}
                    onCheckedChange={(checked) => setValue(`speakers.${index}.is_featured`, checked)}
                  />
                  <Label>Featured Speaker</Label>
                </div>
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea {...register(`speakers.${index}.bio`)} placeholder="Short bio..." rows={2} />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => addSpeaker({ name: "", designation: "", company: "", bio: "", is_featured: false })}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Speaker
          </Button>
        </CardContent>
      </Card>

      {/* Status & Submit */}
      <Card>
        <CardHeader>
          <CardTitle>Publication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={watch("status")} onValueChange={(v) => setValue("status", v as "draft" | "published")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft - Save but don't publish</SelectItem>
                <SelectItem value="published">Published - Make visible to everyone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="flex-1">
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Update Event"
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
