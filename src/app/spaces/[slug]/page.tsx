"use client"

import { use, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/store/auth"
import { addHours, endOfMonth, format, parseISO, startOfMonth } from "date-fns"
import {
  AlertCircle,
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  FlaskConical,
  Info,
  Leaf,
  Loader2,
  MapPin,
  Monitor,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react"

import type { LabSlotType, LabSpaceType } from "@/types/lab"
import {
  canBookWithQuota,
  formatQuotaStatus,
  LAB_SPACE_TYPES,
  SLOT_TYPE_DURATIONS,
  useCreateLabBooking,
  useLabQuota,
  useLabSpace,
  useLabSpaceAvailability,
} from "@/hooks/useLabBookings"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const SPACE_ICONS: Record<LabSpaceType, React.ReactNode> = {
  wet_lab: <FlaskConical className="h-8 w-8" />,
  dry_lab: <Monitor className="h-8 w-8" />,
  greenhouse: <Leaf className="h-8 w-8" />,
  mobile_lab: <Truck className="h-8 w-8" />,
}

const SPACE_COLORS: Record<LabSpaceType, string> = {
  wet_lab: "from-blue-500 to-cyan-500",
  dry_lab: "from-purple-500 to-indigo-500",
  greenhouse: "from-green-500 to-emerald-500",
  mobile_lab: "from-orange-500 to-amber-500",
}

export default function LabSpaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const isLocal =
    process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("localhost") ||
    process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("127.0.0.1")
  const { slug } = use(params)
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  // Defensive normalization for arrays that might be undefined from API
  const normalizeArrayField = (arr: any[] | null | undefined): any[] =>
    Array.isArray(arr) ? arr : []

  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("09:00")
  const [slotType, setSlotType] = useState<LabSlotType>("hourly")
  const [purpose, setPurpose] = useState("")
  const [title, setTitle] = useState("")

  // Fetch lab space details
  const { data: space, isLoading, error } = useLabSpace(slug)

  // Fetch quota (only if authenticated)
  const { data: quota, isLoading: quotaLoading } = useLabQuota({
    enabled: isAuthenticated,
  })

  // Fetch availability for current month
  const now = new Date()
  const { data: availability } = useLabSpaceAvailability(slug, {
    start: startOfMonth(now).toISOString(),
    end: endOfMonth(now).toISOString(),
  })

  // Create booking mutation
  const createBooking = useCreateLabBooking()

  // Calculate booking hours
  const bookingHours = SLOT_TYPE_DURATIONS[slotType]?.hours || 1

  // Handle booking submission
  const handleBooking = async () => {
    if (!space || !selectedDate) return

    const startsAt = new Date(selectedDate)
    const [hours, minutes] = selectedTime.split(":").map(Number)
    startsAt.setHours(hours, minutes, 0, 0)

    const endsAt = addHours(startsAt, bookingHours)

    try {
      await createBooking.mutateAsync({
        lab_space_id: space.id,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        purpose,
        title: title || undefined,
        slot_type: slotType,
      })

      setBookingDialogOpen(false)
      // Reset form
      setSelectedDate(undefined)
      setSelectedTime("09:00")
      setPurpose("")
      setTitle("")

      // Redirect to bookings page
      router.push("/dashboard/bookings")
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !space) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-lg p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h3 className="mb-2 text-lg font-medium">Lab space not found</h3>
          <p className="mb-4 text-muted-foreground">
            The lab space you're looking for doesn't exist or is no longer
            available.
          </p>
          <Button asChild>
            <Link href="/spaces">View All Lab Spaces</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const icon = SPACE_ICONS[space.type]
  const gradient = SPACE_COLORS[space.type]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Header */}
      <section className={`relative bg-gradient-to-r py-16 ${gradient}`}>
        {space.image_url && (
          <Image
            src={space.image_url}
            alt={space.name}
            fill
            unoptimized={isLocal}
            className="object-cover opacity-20"
          />
        )}
        <div className="container relative mx-auto px-4">
          <Button
            variant="ghost"
            asChild
            className="mb-4 text-white hover:bg-white/20"
          >
            <Link href="/spaces">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lab Spaces
            </Link>
          </Button>

          <div className="flex items-start gap-4">
            <div className="rounded-full bg-white/20 p-4 text-white backdrop-blur-sm">
              {icon}
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h1 className="text-3xl font-bold text-white md:text-4xl">
                  {space.name}
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-white/90 text-foreground"
                >
                  {space.type_name}
                </Badge>
              </div>
              <p className="max-w-2xl text-white/80">{space.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="space-y-6 lg:col-span-2">
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="safety">Safety</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>About this Space</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{space.description}</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Capacity
                          </p>
                          <p className="font-medium">{space.capacity} people</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Location
                          </p>
                          <p className="font-medium">
                            {space.location || space.county || "Location TBD"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Amenities</CardTitle>
                    <CardDescription>
                      Equipment and facilities included with this space
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {normalizeArrayField(space.amenities).length > 0 ? (
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {normalizeArrayField(space.amenities).map(
                          (amenity, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                              <span className="text-sm">{amenity}</span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        No amenities listed.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="safety" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      Safety Requirements
                    </CardTitle>
                    <CardDescription>
                      Required certifications and safety protocol
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {normalizeArrayField(space.safety_requirements).length >
                    0 ? (
                      <ul className="space-y-2">
                        {normalizeArrayField(space.safety_requirements).map(
                          (req, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2"
                            >
                              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                              <span className="text-sm">{req}</span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        No specific requirements.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-4">
            {/* Quota Card */}
            {isAuthenticated && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Your Lab Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  {quotaLoading ? (
                    <Skeleton className="h-6 w-32" />
                  ) : quota ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {quota.has_access ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-sm font-medium">
                          {formatQuotaStatus(quota)}
                        </span>
                      </div>
                      {quota.has_access && quota.resets_at && (
                        <p className="text-xs text-muted-foreground">
                          Resets{" "}
                          {format(parseISO(quota.resets_at), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Book This Space
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAuthenticated ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Sign in to book</AlertTitle>
                    <AlertDescription>
                      You need to be logged in with an active subscription to
                      book lab spaces.
                    </AlertDescription>
                  </Alert>
                ) : !quota?.has_access ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Subscription required</AlertTitle>
                    <AlertDescription>
                      Your current plan doesn't include lab access. Upgrade to
                      unlock lab bookings.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred date and time to reserve this lab
                      space.
                    </p>

                    <Dialog
                      open={bookingDialogOpen}
                      onOpenChange={setBookingDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button className="w-full" size="lg">
                          Check Availability & Book
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Book {space.name}</DialogTitle>
                          <DialogDescription>
                            Fill in the details below to request a booking.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          {/* Date Selection */}
                          <div className="space-y-2">
                            <Label>Select Date</Label>
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              disabled={(date: Date) => date < new Date()}
                              className="rounded-md border"
                            />
                          </div>

                          {/* Time Selection */}
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Start Time</Label>
                              <Select
                                value={selectedTime}
                                onValueChange={setSelectedTime}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "08:00",
                                    "09:00",
                                    "10:00",
                                    "11:00",
                                    "12:00",
                                    "13:00",
                                    "14:00",
                                    "15:00",
                                    "16:00",
                                    "17:00",
                                  ].map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Duration</Label>
                              <Select
                                value={slotType}
                                onValueChange={(v) =>
                                  setSlotType(v as LabSlotType)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(SLOT_TYPE_DURATIONS).map(
                                    ([key, val]) => (
                                      <SelectItem key={key} value={key}>
                                        {val.label}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Title (optional) */}
                          <div className="space-y-2">
                            <Label>Booking Title (optional)</Label>
                            <Input
                              placeholder="e.g., PCR Experiment"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                            />
                          </div>

                          {/* Purpose */}
                          <div className="space-y-2">
                            <Label>Purpose *</Label>
                            <Textarea
                              placeholder="Describe what you'll be working on..."
                              value={purpose}
                              onChange={(e) => setPurpose(e.target.value)}
                              rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                              Minimum 10 characters required.
                            </p>
                          </div>

                          {/* Quota Warning */}
                          {quota && !canBookWithQuota(quota, bookingHours) && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Insufficient quota</AlertTitle>
                              <AlertDescription>
                                You need {bookingHours}h but only have{" "}
                                {quota?.remaining}h remaining.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setBookingDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleBooking}
                            disabled={
                              !selectedDate ||
                              purpose.length < 10 ||
                              !canBookWithQuota(quota!, bookingHours) ||
                              createBooking.isPending
                            }
                          >
                            {createBooking.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Submit Booking
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </CardContent>
              <CardFooter className="pt-0 text-xs text-muted-foreground">
                {quota?.has_access && user && (
                  <>
                    {quota.unlimited || (quota.remaining || 0) >= 16 ? (
                      <span className="text-green-600">
                        Auto-approved for your plan
                      </span>
                    ) : (
                      <span>Booking requires admin approval</span>
                    )}
                  </>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
