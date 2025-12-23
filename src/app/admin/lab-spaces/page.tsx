"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { labSpacesAdminApi } from "@/lib/api-admin"
import { useAuth } from "@/store/auth"
import { format } from "date-fns"
import Swal from "sweetalert2"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Unauthorized } from "@/components/unauthorized"
import { 
  Plus, 
  Pencil, 
  Trash2, 
  FlaskConical, 
  Monitor, 
  Leaf, 
  Truck,
  Users,
  Loader2,
} from "lucide-react"
import type { LabSpace, LabSpaceType } from "@/types/lab"

const SPACE_TYPES = [
  { value: "wet_lab", label: "Wet Lab", icon: FlaskConical },
  { value: "dry_lab", label: "Dry Lab", icon: Monitor },
  { value: "greenhouse", label: "Greenhouse", icon: Leaf },
  { value: "mobile_lab", label: "Mobile Lab", icon: Truck },
]

const getSpaceIcon = (type: LabSpaceType) => {
  const found = SPACE_TYPES.find((t) => t.value === type)
  const Icon = found?.icon || FlaskConical
  return <Icon className="h-4 w-4" />
}

export default function AdminLabSpacesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSpace, setEditingSpace] = useState<LabSpace | null>(null)
  const [formData, setFormData] = useState<Partial<LabSpace>>({
    name: "",
    type: "wet_lab",
    description: "",
    capacity: 10,
    hourly_rate: 0,
    amenities: [],
    safety_requirements: [],
    is_active: true,
  })
  const [amenitiesText, setAmenitiesText] = useState("")
  const [safetyText, setSafetyText] = useState("")

  // Fetch lab spaces
  const { data: spacesData, isLoading, error } = useQuery({
    queryKey: ["admin-lab-spaces"],
    queryFn: async () => {
      const res = await labSpacesAdminApi.list({ per_page: 50 })
      return res.data
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<LabSpace>) => labSpacesAdminApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lab-spaces"] })
      queryClient.invalidateQueries({ queryKey: ["lab-spaces"] })
      toast.success("Lab space created successfully!")
      closeDialog()
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create lab space")
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LabSpace> }) =>
      labSpacesAdminApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lab-spaces"] })
      queryClient.invalidateQueries({ queryKey: ["lab-spaces"] })
      toast.success("Lab space updated successfully!")
      closeDialog()
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update lab space")
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => labSpacesAdminApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lab-spaces"] })
      queryClient.invalidateQueries({ queryKey: ["lab-spaces"] })
      toast.success("Lab space deleted successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete lab space")
    },
  })

  const spaces = spacesData || []

  const openCreateDialog = () => {
    setEditingSpace(null)
    setFormData({
      name: "",
      type: "wet_lab",
      description: "",
      capacity: 10,
      hourly_rate: 0,
      amenities: [],
      safety_requirements: [],
      is_active: true,
    })
    setAmenitiesText("")
    setSafetyText("")
    setDialogOpen(true)
  }

  const openEditDialog = (space: LabSpace) => {
    setEditingSpace(space)
    setFormData({
      name: space.name,
      type: space.type,
      description: space.description,
      capacity: space.capacity,
      hourly_rate: space.hourly_rate,
      is_active: space.is_active,
    })
    setAmenitiesText(space.amenities.join("\n"))
    setSafetyText(space.safety_requirements.join("\n"))
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingSpace(null)
  }

  const handleSubmit = async () => {
    const data = {
      ...formData,
      amenities: amenitiesText.split("\n").map((s) => s.trim()).filter(Boolean),
      safety_requirements: safetyText.split("\n").map((s) => s.trim()).filter(Boolean),
    }

    if (editingSpace) {
      await updateMutation.mutateAsync({ id: editingSpace.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleDelete = async (space: LabSpace) => {
    const result = await Swal.fire({
      title: "Delete Lab Space",
      text: `Are you sure you want to delete "${space.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    })

    if (result.isConfirmed) {
      await deleteMutation.mutateAsync(space.id)
    }
  }

  // Authorization check
  const canManage = user?.ui_permissions?.can_manage_lab_spaces

  if (authLoading) {
    return (
      <AdminDashboardShell title="Lab Spaces">
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
    <AdminDashboardShell title="Lab Spaces">
      <div className="space-y-4">
        {/* Header Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Lab Spaces Management
                </CardTitle>
                <CardDescription>
                  Manage laboratory spaces available for booking
                </CardDescription>
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Lab Space
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Spaces Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">
                Failed to load lab spaces
              </div>
            ) : spaces.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No lab spaces yet. Click "Add Lab Space" to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Hourly Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spaces.map((space) => (
                      <TableRow key={space.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getSpaceIcon(space.type)}
                            {space.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{space.type_name}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            {space.capacity}
                          </div>
                        </TableCell>
                        <TableCell>
                          {space.hourly_rate > 0 ? (
                            `KES ${space.hourly_rate}`
                          ) : (
                            <span className="text-green-600">Free</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={space.is_active ? "default" : "secondary"}>
                            {space.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(space)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(space)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSpace ? "Edit Lab Space" : "Create Lab Space"}
            </DialogTitle>
            <DialogDescription>
              {editingSpace
                ? "Update the lab space details below."
                : "Fill in the details to create a new lab space."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Chemistry Lab"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as LabSpaceType })}
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

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the lab space..."
                rows={3}
              />
            </div>

            {/* Capacity & Rate */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  value={formData.capacity || 1}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate (KES)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  min={0}
                  value={formData.hourly_rate || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, hourly_rate: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities (one per line)</Label>
              <Textarea
                id="amenities"
                value={amenitiesText}
                onChange={(e) => setAmenitiesText(e.target.value)}
                placeholder="Fume hood&#10;Microscopes&#10;Chemical storage"
                rows={3}
              />
            </div>

            {/* Safety Requirements */}
            <div className="space-y-2">
              <Label htmlFor="safety">Safety Requirements (one per line)</Label>
              <Textarea
                id="safety"
                value={safetyText}
                onChange={(e) => setSafetyText(e.target.value)}
                placeholder="Lab coat required&#10;Safety goggles&#10;Closed-toe shoes"
                rows={3}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.name ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingSpace ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminDashboardShell>
  )
}
