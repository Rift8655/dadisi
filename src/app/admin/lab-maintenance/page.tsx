"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { labMaintenanceAdminApi, labSpacesAdminApi, LabMaintenanceBlock } from "@/lib/api-admin"
import { useAuth } from "@/store/auth"
import { format, parseISO } from "date-fns"
import Swal from "sweetalert2"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Wrench,
  Calendar,
  Clock,
  Loader2,
  FlaskConical,
} from "lucide-react"

export default function AdminLabMaintenancePage() {
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  
  const [spaceFilter, setSpaceFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<LabMaintenanceBlock | null>(null)
  const [formData, setFormData] = useState({
    lab_space_id: 0,
    title: "",
    reason: "",
    starts_at: "",
    ends_at: "",
  })

  // Fetch maintenance blocks
  const { data: blocksData, isLoading, error } = useQuery({
    queryKey: ["admin-lab-maintenance", spaceFilter],
    queryFn: async () => {
      const params: any = { per_page: 50 }
      if (spaceFilter !== "all") params.lab_space_id = parseInt(spaceFilter)
      const res = await labMaintenanceAdminApi.list(params)
      return res.data
    },
  })

  // Fetch spaces for filter and form
  const { data: spacesData } = useQuery({
    queryKey: ["admin-lab-spaces-list"],
    queryFn: async () => {
      const res = await labSpacesAdminApi.list({ per_page: 50 })
      return res.data
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => labMaintenanceAdminApi.create({
      lab_space_id: data.lab_space_id,
      title: data.title,
      reason: data.reason || undefined,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lab-maintenance"] })
      toast.success("Maintenance block created!")
      closeDialog()
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create maintenance block")
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<typeof formData> }) =>
      labMaintenanceAdminApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lab-maintenance"] })
      toast.success("Maintenance block updated!")
      closeDialog()
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update maintenance block")
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => labMaintenanceAdminApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lab-maintenance"] })
      toast.success("Maintenance block deleted!")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete maintenance block")
    },
  })

  const blocks = blocksData || []
  const spaces = spacesData || []

  const openCreateDialog = () => {
    setEditingBlock(null)
    setFormData({
      lab_space_id: spaces[0]?.id || 0,
      title: "",
      reason: "",
      starts_at: "",
      ends_at: "",
    })
    setDialogOpen(true)
  }

  const openEditDialog = (block: LabMaintenanceBlock) => {
    setEditingBlock(block)
    setFormData({
      lab_space_id: block.lab_space_id,
      title: block.title,
      reason: block.reason || "",
      starts_at: block.starts_at.slice(0, 16), // Format for datetime-local
      ends_at: block.ends_at.slice(0, 16),
    })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingBlock(null)
  }

  const handleSubmit = async () => {
    if (editingBlock) {
      await updateMutation.mutateAsync({
        id: editingBlock.id,
        data: {
          title: formData.title,
          reason: formData.reason,
          starts_at: formData.starts_at,
          ends_at: formData.ends_at,
        },
      })
    } else {
      await createMutation.mutateAsync(formData)
    }
  }

  const handleDelete = async (block: LabMaintenanceBlock) => {
    const result = await Swal.fire({
      title: "Delete Maintenance Block",
      text: `Are you sure you want to delete "${block.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    })

    if (result.isConfirmed) {
      await deleteMutation.mutateAsync(block.id)
    }
  }

  // Authorization check
  const canManage = user?.ui_permissions?.can_manage_lab_spaces

  if (authLoading) {
    return (
      <AdminDashboardShell title="Lab Maintenance">
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
    <AdminDashboardShell title="Lab Maintenance">
      <div className="space-y-4">
        {/* Header Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Maintenance Blocks
                </CardTitle>
                <CardDescription>
                  Schedule maintenance periods when lab spaces are unavailable for booking
                </CardDescription>
              </div>
              <Button onClick={openCreateDialog} disabled={spaces.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Maintenance Block
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Filter Card */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-4">
              <Select value={spaceFilter} onValueChange={setSpaceFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by space" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Spaces</SelectItem>
                  {spaces.map((space) => (
                    <SelectItem key={space.id} value={String(space.id)}>
                      {space.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Table */}
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
                Failed to load maintenance blocks
              </div>
            ) : blocks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No maintenance blocks scheduled. Click "Add Maintenance Block" to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lab Space</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blocks.map((block) => {
                      const startsAt = parseISO(block.starts_at)
                      const endsAt = parseISO(block.ends_at)
                      const isPast = new Date() > endsAt

                      return (
                        <TableRow key={block.id} className={isPast ? "opacity-50" : ""}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FlaskConical className="h-4 w-4 text-muted-foreground" />
                              {block.lab_space?.name || "Unknown"}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {block.title}
                            {isPast && (
                              <Badge variant="secondary" className="ml-2">Past</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                {format(startsAt, "MMM d, yyyy")}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {format(startsAt, "h:mm a")} - {format(endsAt, "h:mm a")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {block.reason || "-"}
                          </TableCell>
                          <TableCell>
                            {block.creator?.username || "Unknown"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(block)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(block)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBlock ? "Edit Maintenance Block" : "Schedule Maintenance"}
            </DialogTitle>
            <DialogDescription>
              {editingBlock
                ? "Update the maintenance block details."
                : "Block off a time period for lab maintenance."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Lab Space */}
            {!editingBlock && (
              <div className="space-y-2">
                <Label htmlFor="lab_space_id">Lab Space *</Label>
                <Select
                  value={String(formData.lab_space_id)}
                  onValueChange={(v) => setFormData({ ...formData, lab_space_id: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lab space" />
                  </SelectTrigger>
                  <SelectContent>
                    {spaces.map((space) => (
                      <SelectItem key={space.id} value={String(space.id)}>
                        {space.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Annual Equipment Calibration"
              />
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Describe the maintenance activities..."
                rows={2}
              />
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="starts_at">Start Time *</Label>
              <Input
                id="starts_at"
                type="datetime-local"
                value={formData.starts_at}
                onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
              />
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="ends_at">End Time *</Label>
              <Input
                id="ends_at"
                type="datetime-local"
                value={formData.ends_at}
                onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
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
                !formData.title ||
                !formData.starts_at ||
                !formData.ends_at ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingBlock ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminDashboardShell>
  )
}
