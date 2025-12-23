"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Users,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  UserX,
  MapPin,
  Settings2,
} from "lucide-react"
import { adminApi } from "@/lib/api-admin"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { AccessDenied } from "@/components/admin/AccessDenied"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/store/auth"
import { toast } from "sonner"

interface Group {
  id: number
  name: string
  slug: string
  description: string | null
  county: { id: number; name: string } | null
  member_count: number
  is_active: boolean
  is_private: boolean
}

interface GroupMember {
  id: number
  username: string
  joined_at: string
  memberProfile?: {
    first_name: string
    last_name: string
    profile_picture_path: string | null
  }
}

export default function ForumGroupsAdminPage() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [managingMembersGroup, setManagingMembersGroup] = useState<Group | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [membersDialogOpen, setMembersDialogOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
    is_private: false,
  })

  // Permission check
  const canManage = user?.ui_permissions?.can_manage_groups || 
                    user?.roles?.some((r: { name: string }) => ['admin', 'super_admin'].includes(r.name))

  // Fetch groups
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-forum-groups", search],
    queryFn: () => adminApi.groups.list({ search: search || undefined }),
    enabled: canManage,
  })

  // Fetch members for a group
  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["admin-group-members", managingMembersGroup?.id],
    queryFn: () => adminApi.groups.members(managingMembersGroup!.id),
    enabled: !!managingMembersGroup && membersDialogOpen,
  })

  const allGroups = data?.data ?? []
  const groupMembers = membersData?.data ?? []

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof formData }) => 
      adminApi.groups.update(id, data),
    onSuccess: () => {
      toast.success("Group updated successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-forum-groups"] })
      setEditDialogOpen(false)
    },
    onError: (err: any) => toast.error(err.message || "Failed to update group"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.groups.delete(id),
    onSuccess: () => {
      toast.success("Group deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-forum-groups"] })
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete group"),
  })

  const removeMemberMutation = useMutation({
    mutationFn: (userId: number) => 
      adminApi.groups.removeMember(managingMembersGroup!.id, userId),
    onSuccess: () => {
      toast.success("Member removed from group")
      queryClient.invalidateQueries({ queryKey: ["admin-group-members", managingMembersGroup?.id] })
      queryClient.invalidateQueries({ queryKey: ["admin-forum-groups"] })
    },
    onError: (err: any) => toast.error(err.message || "Failed to remove member"),
  })

  const handleEdit = (group: Group) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description || "",
      is_active: group.is_active,
      is_private: group.is_private,
    })
    setEditDialogOpen(true)
  }

  const handleManageMembers = (group: Group) => {
    setManagingMembersGroup(group)
    setMembersDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingGroup) {
      updateMutation.mutate({ id: editingGroup.id, data: formData })
    }
  }

  if (!isAuthenticated || !canManage) {
    return (
      <AdminDashboardShell title="Forum Groups">
        <AccessDenied 
          message="You don't have permission to manage county groups."
          requiredPermission="Administrator"
          backHref="/admin/forum"
          backLabel="Back to Forum Admin"
        />
      </AdminDashboardShell>
    )
  }

  return (
    <AdminDashboardShell title="Forum Groups">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link href="/admin/forum">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Forum Admin
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Groups Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage county-based community hubs and their memberships.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="py-12 text-center text-destructive">
                Failed to load groups. Please try again.
              </div>
            ) : allGroups.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No groups found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead className="hidden md:table-cell">County</TableHead>
                    <TableHead className="hidden lg:table-cell text-center">Members</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allGroups.map((group: Group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <span className="font-medium block truncate">{group.name}</span>
                          <span className="text-xs text-muted-foreground truncate block max-w-[250px]">
                            {group.description || "No description provided."}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                          {group.county?.name || "Global"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-center">
                        <Badge variant="secondary" className="cursor-pointer hover:bg-muted" onClick={() => handleManageMembers(group)}>
                          {group.member_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {group.is_active ? (
                          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                             Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                             Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Edit Settings"
                            onClick={() => handleEdit(group)}
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Manage Members"
                            onClick={() => handleManageMembers(group)}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete group "${group.name}"?`)) {
                                deleteMutation.mutate(group.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Group Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Group Settings</DialogTitle>
              <DialogDescription>
                Update basic information and visibility for this community hub.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between border p-3 rounded-lg">
                <div className="space-y-0.5">
                  <Label>Active Status</Label>
                  <p className="text-xs text-muted-foreground">Is this group visible to members?</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div className="flex items-center justify-between border p-3 rounded-lg">
                <div className="space-y-0.5">
                  <Label>Private Group</Label>
                  <p className="text-xs text-muted-foreground">Require invitation or approval to join?</p>
                </div>
                <Switch
                  checked={formData.is_private}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_private: checked })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Members Dialog */}
        <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Group Members: {managingMembersGroup?.name}</DialogTitle>
              <DialogDescription>
                View and manage users who have joined this community group.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto py-4">
              {isLoadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : groupMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No members in this group yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupMembers.map((member: GroupMember) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.memberProfile?.profile_picture_path || ""} />
                              <AvatarFallback>{member.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{member.username}</p>
                              {member.memberProfile && (
                                <p className="text-xs text-muted-foreground">
                                  {member.memberProfile.first_name} {member.memberProfile.last_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(member.joined_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            title="Remove Member"
                            onClick={() => {
                              if (confirm(`Remove ${member.username} from this group?`)) {
                                removeMemberMutation.mutate(member.id)
                              }
                            }}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setMembersDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardShell>
  )
}
