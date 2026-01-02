"use client"

import { useState, useRef, useEffect } from "react"
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
  Upload,
  X,
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
import { CreateEventSchema, CreateEventInput, CreateEventFormValues, TicketInput, SpeakerInput } from "@/schemas/event-form"
import { eventsApi, mediaApi } from "@/lib/api"
import { eventsAdminApi } from "@/lib/api-admin"
import { api } from "@/lib/api"
import Swal from "sweetalert2"
import { toast } from "sonner"
import type { Event, EventCategory, EventTag, County } from "@/types"

interface EventFormProps {
  initialData?: Event
  isEdit?: boolean
  isAdmin?: boolean
}

export function EventForm({ initialData, isEdit = false, isAdmin = false }: EventFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateEventFormValues>({
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
      county_id: initialData?.county?.id || (initialData as any)?.county_id || undefined,
      capacity: initialData?.capacity?.toString() || "",
      waitlist_enabled: initialData?.waitlist_enabled || false,
      waitlist_capacity: initialData?.waitlist_capacity?.toString() || "",
      pricing_type: (initialData?.price && initialData.price > 0) ? "paid" : "free",
      price: initialData?.price || 0,
      currency: initialData?.currency || "KES",
      status: (initialData?.status as "draft" | "published") || "draft",
      tag_ids: initialData?.tags?.map((t) => t.id) || [],
      tickets: initialData?.tickets?.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description || "",
        price: Number(t.price),
        quantity: t.quantity || (t as any).capacity || 0,
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

  // Reset form when initialData changes (for async data loading)
  useEffect(() => {
    if (initialData && isEdit) {
      console.log("[EventForm] Resetting form with initialData:", initialData)
      console.log("[EventForm] registration_deadline:", initialData.registration_deadline)
      reset({
        title: initialData.title || "",
        description: initialData.description || "",
        category_id: initialData.category?.id || 0,
        starts_at: initialData.starts_at ? format(new Date(initialData.starts_at), "yyyy-MM-dd'T'HH:mm") : "",
        ends_at: initialData.ends_at ? format(new Date(initialData.ends_at), "yyyy-MM-dd'T'HH:mm") : "",
        registration_deadline: initialData.registration_deadline
          ? format(new Date(initialData.registration_deadline), "yyyy-MM-dd'T'HH:mm")
          : "",
        is_online: initialData.is_online || false,
        venue: initialData.venue || "",
        online_link: initialData.online_link || "",
        county_id: (() => {
          const countyId = initialData.county?.id || (initialData as any).county_id
          console.log("[EventForm] county data:", { county: initialData.county, county_id: (initialData as any).county_id, resolved: countyId })
          return countyId || undefined
        })(),
        capacity: initialData.capacity?.toString() || "",
        waitlist_enabled: initialData.waitlist_enabled || false,
        waitlist_capacity: initialData.waitlist_capacity?.toString() || "",
        pricing_type: (initialData.price && Number(initialData.price) > 0) ? "paid" : "free",
        price: initialData.price || 0,
        currency: initialData.currency || "KES",
        status: (initialData.status as "draft" | "published") || "draft",
        tag_ids: initialData.tags?.map((t) => t.id) || [],
        tickets: initialData.tickets?.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description || "",
          price: Number(t.price),
          quantity: t.quantity || (t as any).capacity || 0,
          is_active: t.is_active,
        })) || [],
        speakers: initialData.speakers?.map((s) => ({
          id: s.id,
          name: s.name,
          designation: s.designation || "",
          company: s.company || "",
          bio: s.bio || "",
          is_featured: s.is_featured,
        })) || [],
      })
      // Also set the image if exists
      if (initialData.image_path || initialData.image_url) {
        let path = initialData.image_path || null
        if (path && path.startsWith('/')) path = path.substring(1)
        setImagePath(path)
        setImagePreview(initialData.image_url || null)
      } else {
        setImagePath(null)
        setImagePreview(null)
      }
    }
  }, [initialData, isEdit, reset])

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

  // Image upload state
  const [imagePath, setImagePath] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle image file selection and upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('collection', 'events')
      const response = await mediaApi.upload(formData) as any
      const uploadedPath = response?.data?.file_path || response?.file_path || response?.data?.path || response?.path
      if (uploadedPath) {
        // Strip leading slash if present for storage path consistency
        const cleanPath = uploadedPath.startsWith('/') ? uploadedPath.substring(1) : uploadedPath
        setImagePath(cleanPath)
        toast.success('Image uploaded successfully')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
      setImagePreview(null)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const removeImage = () => {
    setImagePath(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const mutation = useMutation({
    mutationFn: async (data: CreateEventFormValues) => {
      // Include image_path in the submission
      const submitData = { ...data, image_path: imagePath } as any
      if (isEdit && initialData?.id) {
        // Use admin API for admin context, otherwise use public API
        if (isAdmin) {
          return eventsAdminApi.update(initialData.id, submitData)
        }
        return eventsApi.update(initialData.id, submitData)
      } else {
        // For creation, admins use admin API
        if (isAdmin) {
          return eventsAdminApi.create(submitData)
        }
        return eventsApi.create(submitData)
      }
    },
    onSuccess: (_: any, variables: CreateEventFormValues) => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
      queryClient.invalidateQueries({ queryKey: ["admin-events"] })
      Swal.fire({
        icon: "success",
        title: isEdit ? "Event Updated!" : "Event Created!",
        text: !isEdit && variables.status === "published" ? "Your event is now live!" : (!isEdit ? "Event saved as draft." : undefined),
        timer: 1500,
        showConfirmButton: false,
      })
      // Redirect based on context
      if (isAdmin) {
        router.push("/admin/events")
      } else {
        router.push("/dashboard/organizer/events")
      }
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
  const pricingType = watch("pricing_type")
  const basePrice = watch("price")
  const capacityValue = watch("capacity")

  // Auto-generate General Admission ticket when base price is entered for paid events
  // Uses 999999 as a sentinel value for "unlimited" when capacity is not set
  const UNLIMITED_QUANTITY = 999999

  useEffect(() => {
    console.log("[EventForm] Ticket sync effect:", { pricingType, basePrice, isEdit, ticketCount: getValues("tickets")?.length })
    
    // Only run auto-generation logic if it's a paid event with a price
    if (pricingType === "paid" && basePrice && Number(basePrice) > 0) {
      const tickets = getValues("tickets") || []
      const generalAdmissionIndex = tickets.findIndex(t => t.name === "General Admission")
      const ticketQuantity = capacityValue ? Number(capacityValue) : UNLIMITED_QUANTITY
      
      console.log("[EventForm] Ticket sync:", { 
        tickets: tickets.map(t => ({ name: t.name, price: t.price })),
        generalAdmissionIndex,
        basePrice,
        ticketQuantity
      })
      
      if (tickets.length === 0 && !isEdit) {
        // CREATE MODE ONLY: No tickets at all - create a General Admission ticket
        addTicket({
          name: "General Admission",
          price: basePrice,
          quantity: ticketQuantity,
          is_active: true,
        })
      } else if (generalAdmissionIndex !== -1) {
        // UPDATE: Sync existing General Admission ticket price and quantity
        setValue(`tickets.${generalAdmissionIndex}.price`, Number(basePrice))
        setValue(`tickets.${generalAdmissionIndex}.quantity`, ticketQuantity)
      }
      // Note: In edit mode with no General Admission ticket, user must manually manage tickets
    }
  }, [pricingType, basePrice, addTicket, getValues, setValue, capacityValue, isEdit])

  // Directly sync capacity changes to General Admission ticket quantity
  useEffect(() => {
    const tickets = getValues("tickets") || []
    const generalAdmissionIndex = tickets.findIndex(t => t.name === "General Admission")
    
    if (generalAdmissionIndex !== -1) {
      const newQuantity = capacityValue ? Number(capacityValue) : UNLIMITED_QUANTITY
      setValue(`tickets.${generalAdmissionIndex}.quantity`, newQuantity)
    }
  }, [capacityValue, getValues, setValue])

  // Auto-switch to free pricing when online event is selected (paid not allowed for online)
  useEffect(() => {
    if (isOnline && pricingType === "paid") {
      setValue("pricing_type", "free")
      setValue("price", 0)
    }
  }, [isOnline, pricingType, setValue])

  const toggleTag = (tagId: number) => {
    const current = selectedTagIds
    if (current.includes(tagId)) {
      setValue("tag_ids", current.filter((id) => id !== tagId))
    } else {
      setValue("tag_ids", [...current, tagId])
    }
  }

  const onSubmit = (data: CreateEventFormValues) => {
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

          {/* Event Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="border-2 border-dashed rounded-lg p-4 transition-colors hover:border-primary/50">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Event cover preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-36 cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click to upload cover image</span>
                  <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
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
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input id="capacity" type="number" {...register("capacity")} placeholder="Leave empty for unlimited" />
          </div>

          {/* Free/Paid Toggle */}
          <div className="space-y-2">
            <Label>Pricing Type</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="free"
                  checked={watch("pricing_type") === "free"}
                  onChange={() => {
                    setValue("pricing_type", "free")
                    setValue("price", 0)
                  }}
                  className="accent-primary"
                />
                <span>Free Event</span>
              </label>
              <label className={`flex items-center gap-2 ${isOnline ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
                <input
                  type="radio"
                  value="paid"
                  checked={watch("pricing_type") === "paid"}
                  onChange={() => setValue("pricing_type", "paid")}
                  className="accent-primary"
                  disabled={isOnline}
                />
                <span>Paid Event</span>
              </label>
            </div>
            {isOnline && (
              <p className="text-xs text-muted-foreground">Online events can only be free.</p>
            )}
          </div>

          {/* Price & Currency - only shown for paid events */}
          {watch("pricing_type") === "paid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Base Price *</Label>
                <Input id="price" type="number" step="0.01" {...register("price")} placeholder="e.g. 1000" />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
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
          )}

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

      {/* Tickets - Only shown for paid events */}
      {watch("pricing_type") === "paid" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Ticket Tiers
            </CardTitle>
            <CardDescription>
              Add different ticket types for your event. If you don't add any, a "General Admission" ticket will be created at your base price.
            </CardDescription>
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
      )}

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
