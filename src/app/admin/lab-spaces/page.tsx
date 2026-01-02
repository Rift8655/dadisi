"use client"

import Link from "next/link"
import { useAuth } from "@/store/auth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  FlaskConical,
  Leaf,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Truck,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import Swal from "sweetalert2"

import type { LabSpace, LabSpaceType } from "@/types/lab"
import { labSpacesAdminApi } from "@/lib/api-admin"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Unauthorized } from "@/components/unauthorized"

const SPACE_TYPES = [
  { value: "wet_lab", label: "Wet Lab", icon: FlaskConical },
  { value: "dry_lab", label: "Dry Lab", icon: Monitor },
  { value: "greenhouse", label: "Greenhouse", icon: Leaf },
  { value: "mobile_lab", label: "Mobile Lab", icon: Truck },
]

const Monitor = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
)

const getSpaceIcon = (type: LabSpaceType) => {
  const found = SPACE_TYPES.find((t) => t.value === type)
  const Icon = found?.icon || FlaskConical
  return <Icon className="h-4 w-4" />
}

export default function AdminLabSpacesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  // Fetch lab spaces
  const {
    data: spacesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-lab-spaces"],
    queryFn: async () => {
      const res = await labSpacesAdminApi.list({ per_page: 50 })
      return res.data
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
              <Button asChild>
                <Link href="/admin/lab-spaces/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lab Space
                </Link>
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
              <div className="py-8 text-center text-muted-foreground">
                Failed to load lab spaces
              </div>
            ) : spaces.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
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
                      <TableHead>Location</TableHead>
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
                          <div className="flex flex-col text-xs">
                            <span className="font-medium">
                              {space.location || "N/A"}
                            </span>
                            <span className="text-muted-foreground">
                              {space.county}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={space.is_active ? "default" : "secondary"}
                          >
                            {space.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/lab-spaces/${space.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
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
    </AdminDashboardShell>
  )
}
