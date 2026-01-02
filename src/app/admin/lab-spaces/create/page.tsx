"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/store/auth"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, FlaskConical, Loader2 } from "lucide-react"
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

export default function CreateLabSpacePage() {
  const router = useRouter()
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
    is_active: true,
  })
  const [amenitiesText, setAmenitiesText] = useState("")
  const [safetyText, setSafetyText] = useState("")

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<LabSpace>) => labSpacesAdminApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lab-spaces"] })
      queryClient.invalidateQueries({ queryKey: ["lab-spaces"] })
      toast.success("Lab space created successfully!")
      router.push("/admin/lab-spaces")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create lab space")
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

    createMutation.mutate(data)
  }

  // Authorization check
  const canManage = user?.ui_permissions?.can_manage_lab_spaces

  if (authLoading) {
    return (
      <AdminDashboardShell title="Create Lab Space">
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AdminDashboardShell>
    )
  }

  if (!canManage) {
    return <Unauthorized actionHref="/admin" />
  }

  return (
    <AdminDashboardShell title="Create Lab Space">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/lab-spaces">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Add New Lab Space</h1>
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
                    disabled={createMutation.isPending || !formData.name}
                  >
                    {createMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Lab Space
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
