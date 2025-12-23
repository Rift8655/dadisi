"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowLeft,
  MessageSquare,
  Search,
  Pin,
  Lock,
  Unlock,
  Trash2,
  Eye,
  MoreHorizontal,
  Loader2,
  CheckSquare,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/store/auth"
import { forumApi } from "@/lib/api"
import { ForumThread } from "@/schemas/forum"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { AccessDenied } from "@/components/admin/AccessDenied"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function ForumThreadsAdminPage() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selectedThreads, setSelectedThreads] = useState<Set<number>>(new Set())
  const perPage = 20

  // Permission checks
  const canModerate = user?.ui_permissions?.can_moderate_forum || 
                      user?.roles?.some((r: { name: string }) => ['admin', 'super_admin', 'moderator'].includes(r.name))
  const canPin = user?.ui_permissions?.can_moderate_forum || canModerate
  const canLock = user?.ui_permissions?.can_moderate_forum || canModerate
  const canDelete = user?.ui_permissions?.can_moderate_forum || canModerate

  // Fetch threads
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-forum-threads", page, search],
    queryFn: () => forumApi.threads.listAll({ page, per_page: perPage }),
    enabled: canModerate,
  })

  const threads = data?.data ?? []
  const currentPage = data?.current_page ?? 1
  const lastPage = data?.last_page ?? 1

  // Mutations
  const pinMutation = useMutation({
    mutationFn: (slug: string) => forumApi.threads.pin(slug),
    onSuccess: () => {
      toast.success("Thread pinned")
      queryClient.invalidateQueries({ queryKey: ["admin-forum-threads"] })
    },
    onError: () => toast.error("Failed to pin thread"),
  })

  const unpinMutation = useMutation({
    mutationFn: (slug: string) => forumApi.threads.unpin(slug),
    onSuccess: () => {
      toast.success("Thread unpinned")
      queryClient.invalidateQueries({ queryKey: ["admin-forum-threads"] })
    },
    onError: () => toast.error("Failed to unpin thread"),
  })

  const lockMutation = useMutation({
    mutationFn: (slug: string) => forumApi.threads.lock(slug),
    onSuccess: () => {
      toast.success("Thread locked")
      queryClient.invalidateQueries({ queryKey: ["admin-forum-threads"] })
    },
    onError: () => toast.error("Failed to lock thread"),
  })

  const unlockMutation = useMutation({
    mutationFn: (slug: string) => forumApi.threads.unlock(slug),
    onSuccess: () => {
      toast.success("Thread unlocked")
      queryClient.invalidateQueries({ queryKey: ["admin-forum-threads"] })
    },
    onError: () => toast.error("Failed to unlock thread"),
  })

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => forumApi.threads.delete(slug),
    onSuccess: () => {
      toast.success("Thread deleted")
      queryClient.invalidateQueries({ queryKey: ["admin-forum-threads"] })
    },
    onError: () => toast.error("Failed to delete thread"),
  })

  const toggleSelectThread = (id: number) => {
    const newSelected = new Set(selectedThreads)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedThreads(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedThreads.size === threads.length) {
      setSelectedThreads(new Set())
    } else {
      setSelectedThreads(new Set(threads.map((t: ForumThread) => t.id)))
    }
  }

  if (!isAuthenticated || !canModerate) {
    return (
      <AdminDashboardShell title="Forum Threads">
        <AccessDenied 
          message="You don't have permission to manage forum threads."
          requiredPermission="Forum Moderator"
          backHref="/admin/forum"
          backLabel="Back to Forum Admin"
        />
      </AdminDashboardShell>
    )
  }

  return (
    <AdminDashboardShell title="Forum Threads">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link href="/admin/forum">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Forum Admin
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              Threads Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage forum threads: pin, lock, or delete.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search threads by title..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
          {selectedThreads.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedThreads.size} selected</Badge>
              <Button variant="outline" size="sm" onClick={() => setSelectedThreads(new Set())}>
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Threads Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="py-12 text-center text-destructive">
                Failed to load threads. Please try again.
              </div>
            ) : threads.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No threads found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedThreads.size === threads.length && threads.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Thread</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {threads.map((thread: ForumThread) => (
                    <TableRow key={thread.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedThreads.has(thread.id)}
                          onCheckedChange={() => toggleSelectThread(thread.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={thread.user?.profile_picture_path || "/images/default-avatar.png"} />
                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <Link 
                              href={`/forum/threads/${thread.slug}`}
                              className="font-medium hover:text-primary line-clamp-1"
                              target="_blank"
                            >
                              {thread.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              by {thread.user?.username || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {thread.category?.name && (
                          <Badge variant="outline">{thread.category.name}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex gap-1">
                          {thread.is_pinned && (
                            <Badge className="bg-amber-100 text-amber-700 border-none">
                              <Pin className="h-3 w-3 mr-1" /> Pinned
                            </Badge>
                          )}
                          {thread.is_locked && (
                            <Badge variant="secondary">
                              <Lock className="h-3 w-3 mr-1" /> Locked
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/forum/threads/${thread.slug}`} target="_blank">
                                <Eye className="h-4 w-4 mr-2" /> View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {canPin && (
                              <DropdownMenuItem
                                onClick={() => thread.is_pinned ? unpinMutation.mutate(thread.slug) : pinMutation.mutate(thread.slug)}
                              >
                                <Pin className="h-4 w-4 mr-2" />
                                {thread.is_pinned ? "Unpin" : "Pin"}
                              </DropdownMenuItem>
                            )}
                            {canLock && (
                              <DropdownMenuItem
                                onClick={() => thread.is_locked ? unlockMutation.mutate(thread.slug) : lockMutation.mutate(thread.slug)}
                              >
                                {thread.is_locked ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                                {thread.is_locked ? "Unlock" : "Lock"}
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this thread?")) {
                                      deleteMutation.mutate(thread.slug)
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(lastPage, p + 1))}
              disabled={currentPage >= lastPage}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </AdminDashboardShell>
  )
}
