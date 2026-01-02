"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/store/auth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, ArrowLeft, FlaskConical, Loader2 } from "lucide-react"
import { toast } from "sonner"

import type { LabSpace, LabSpaceType } from "@/types/lab"
import { labSpacesAdminApi } from "@/lib/api-admin"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Unauthorized } from "@/components/unauthorized"

const SPACE_TYPES = [
  { value: "wet_lab", label: "Wet Lab" },
  { value: "dry_lab", label: "Dry Lab" },
  { value: "greenhouse", label: "Greenhouse" },
  { value: "mobile_lab", label: "Mobile Lab" },
]

export default function EditLabSpacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<Partial<LabSpace>>({
    name: "",
    type: "wet_lab",
    description: "",
    capacity: 10,
    location: "",
    county: "",
    amenities: [],
    safety_requirements: [],
  })
  const [amenitiesText, setAmenitiesText] = useState("")
  const [safetyText, setSafetyText] = useState("")

  // Fetch space data
  const {
    data: space,
    isLoading: spaceLoading,
    error,
  } = useQuery({
    queryKey: ["admin-lab-space", id],
    queryFn: () => labSpacesAdminApi.get(parseInt(id)),
  })

  useEffect(() => {
    if (space?.data) {
      const s = space.data
      setFormData({
        name: s.name,
        type: s.type as LabSpaceType,
        description: s.description,
        capacity: s.capacity,
        location: s.location,
        county: s.county,
        is_active: s.is_active,
      })
      setAmenitiesText(
        (Array.isArray(s.amenities) ? s.amenities : []).join("\n")
      )
      setSafetyText(
        (Array.isArray(s.safety_requirements)
          ? s.safety_requirements
          : []
        ).join("\n")
      )
    }
  }, [space])

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<LabSpace>) =>
      labSpacesAdminApi.update(parseInt(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lab-spaces"] })
      queryClient.invalidateQueries({ queryKey: ["admin-lab-space", id] })
      queryClient.invalidateQueries({ queryKey: ["lab-spaces"] })
      toast.success("Lab space updated successfully!")
      router.push("/admin/lab-spaces")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update lab space")
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...formData,
      amenities: amenitiesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      safety_requirements: safetyText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    }

    updateMutation.mutate(data)
  }

  // Authorization check
  const canManage = user?.ui_permissions?.can_manage_lab_spaces

  if (authLoading || spaceLoading) {
    return (
      <AdminDashboardShell title="Edit Lab Space">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </AdminDashboardShell>
    )
  }

  if (!canManage) {
    return <Unauthorized actionHref="/admin" />
  }

  if (error || !space?.data) {
    return (
      <AdminDashboardShell title="Edit Lab Space">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-xl font-bold">Lab Space Not Found</h2>
          <p className="mb-6 text-muted-foreground">
            The lab space you're trying to edit doesn't exist or you don't have
            access.
          </p>
          <Button asChild>
            <Link href="/admin/lab-spaces text-primary">
              Back to Lab Spaces
            </Link>
          </Button>
        </div>
      </AdminDashboardShell>
    )
  }

  return (
    <AdminDashboardShell title="Edit Lab Space">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/lab-spaces">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            Edit Lab Space: {space.data.name}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Essential details about the laboratory space
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Main Chemistry Lab"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the lab space..."
                      rows={5}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Type */}
                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(v) =>
                          setFormData({ ...formData, type: v as LabSpaceType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SPACE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Capacity */}
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min={1}
                        value={formData.capacity || 1}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            capacity: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Features & Safety</CardTitle>
                  <CardDescription>
                    List equipment and safety requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Amenities */}
                  <div className="space-y-2">
                    <Label htmlFor="amenities">Amenities (one per line)</Label>
                    <Textarea
                      id="amenities"
                      value={amenitiesText}
                      onChange={(e) => setAmenitiesText(e.target.value)}
                      placeholder="Fume hood&#10;Microscopes&#10;Chemical storage"
                      rows={4}
                    />
                  </div>

                  {/* Safety Requirements */}
                  <div className="space-y-2">
                    <Label htmlFor="safety">
                      Safety Requirements (one per line)
                    </Label>
                    <Textarea
                      id="safety"
                      value={safetyText}
                      onChange={(e) => setSafetyText(e.target.value)}
                      placeholder="Lab coat required&#10;Safety goggles&#10;Closed-toe shoes"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Location & Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* County */}
                  <div className="space-y-2">
                    <Label htmlFor="county">County</Label>
                    <Input
                      id="county"
                      value={formData.county || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, county: e.target.value })
                      }
                      placeholder="e.g., Nairobi"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Specific Location</Label>
                    <Input
                      id="location"
                      value={formData.location || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="e.g., Main Campus, Block B"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_active">Active Status</Label>
                      <CardDescription>
                        Available for booking if active
                      </CardDescription>
                    </div>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updateMutation.isPending || !formData.name}
                  >
                    {updateMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Lab Space
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link href="/admin/lab-spaces">Cancel</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AdminDashboardShell>
  )
}
