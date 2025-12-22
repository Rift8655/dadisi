"use client"

import { useState } from "react"
import { useAuth } from "@/store/auth"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2, MapPin, Loader2, Search } from "lucide-react"
import Swal from "sweetalert2"

import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Unauthorized } from "@/components/unauthorized"
import { countiesApi } from "@/lib/api"
import { countiesAdminApi } from "@/lib/api-admin"

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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface County {
  id: number
  name: string
}

export default function AdminCountiesPage() {
  const { logout } = useAuth()
  const queryClient = useQueryClient()
  
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCounty, setEditingCounty] = useState<County | null>(null)
  const [countyName, setCountyName] = useState("")

  // Fetch counties
  const { data: counties = [], isLoading, error } = useQuery({
    queryKey: ["admin-counties"],
    queryFn: () => countiesApi.list(),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => countiesAdminApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-counties"] })
      queryClient.invalidateQueries({ queryKey: ["counties"] })
      setDialogOpen(false)
      setCountyName("")
      Swal.fire({ icon: "success", title: "County created", timer: 1500, showConfirmButton: false })
    },
    onError: (err: any) => {
      Swal.fire({ icon: "error", title: "Error", text: err.message || "Failed to create county" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) => countiesAdminApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-counties"] })
      queryClient.invalidateQueries({ queryKey: ["counties"] })
      setDialogOpen(false)
      setEditingCounty(null)
      setCountyName("")
      Swal.fire({ icon: "success", title: "County updated", timer: 1500, showConfirmButton: false })
    },
    onError: (err: any) => {
      Swal.fire({ icon: "error", title: "Error", text: err.message || "Failed to update county" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => countiesAdminApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-counties"] })
      queryClient.invalidateQueries({ queryKey: ["counties"] })
      Swal.fire({ icon: "success", title: "County deleted", timer: 1500, showConfirmButton: false })
    },
    onError: (err: any) => {
      Swal.fire({ icon: "error", title: "Error", text: err.message || "Failed to delete county" })
    },
  })

  // Handle 403 (no permission)
  if (error && (error as any).status === 403) {
    return <Unauthorized actionHref="/admin" />
  }

  // Handle 401 (session expired)
  if (error && (error as any).status === 401) {
    logout()
    return null
  }

  const handleOpenCreate = () => {
    setEditingCounty(null)
    setCountyName("")
    setDialogOpen(true)
  }

  const handleOpenEdit = (county: County) => {
    setEditingCounty(county)
    setCountyName(county.name)
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!countyName.trim()) return
    
    if (editingCounty) {
      updateMutation.mutate({ id: editingCounty.id, data: { name: countyName.trim() } })
    } else {
      createMutation.mutate({ name: countyName.trim() })
    }
  }

  const handleDelete = async (county: County) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete County",
      text: `Are you sure you want to delete "${county.name}"? This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    })
    
    if (result.isConfirmed) {
      deleteMutation.mutate(county.id)
    }
  }

  // Filter counties by search
  const filteredCounties = counties.filter((c: County) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <AdminDashboardShell title="Counties Management">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Counties
                </CardTitle>
                <CardDescription>
                  Manage the list of Kenyan counties available across the platform.
                </CardDescription>
              </div>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add County
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-4 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search counties..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCounties.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          {search ? "No counties match your search" : "No counties found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCounties.map((county: County) => (
                        <TableRow key={county.id}>
                          <TableCell className="font-mono text-muted-foreground">
                            {county.id}
                          </TableCell>
                          <TableCell className="font-medium">{county.name}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(county)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(county)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-4">
              Total: {filteredCounties.length} counties
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCounty ? "Edit County" : "Add New County"}
            </DialogTitle>
            <DialogDescription>
              {editingCounty
                ? "Update the county name."
                : "Enter the name of the new county."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="county-name">County Name</Label>
            <Input
              id="county-name"
              value={countyName}
              onChange={(e) => setCountyName(e.target.value)}
              placeholder="e.g., Nairobi"
              className="mt-2"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!countyName.trim() || isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {editingCounty ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminDashboardShell>
  )
}
