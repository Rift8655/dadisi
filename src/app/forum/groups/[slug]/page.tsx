"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/store/auth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  ArrowLeft,
  Calendar,
  LogOut,
  MapPin,
  MessageSquare,
  Plus,
  UserPlus,
  Users,
} from "lucide-react"
import Swal from "sweetalert2"

import { forumApi, groupsApi, memberProfileApi } from "@/lib/api"
import { useForumCategories } from "@/hooks/useForum"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea"
import { ForumSidebar } from "@/components/forum/ForumSidebar"

interface GroupDetailPageProps {
  params: Promise<{ slug: string }>
}

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { slug } = use(params)
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const queryClient = useQueryClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [newThread, setNewThread] = useState({
    title: "",
    content: "",
    category_slug: "",
  })

  // Fetch group details
  const {
    data: groupData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["group", slug],
    queryFn: () => groupsApi.show(slug),
  })

  const group = groupData?.data

  // Fetch categories for thread creation
  const { data: categories = [] } = useForumCategories()

  // Join mutation
  const joinMutation = useMutation({
    mutationFn: () => groupsApi.join(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", slug] })
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      Swal.fire({
        icon: "success",
        title: "Joined!",
        text: `You're now a member of ${group?.name}`,
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (err: any) => {
      Swal.fire("Error", err.message || "Failed to join group", "error")
    },
  })

  // Leave mutation
  const leaveMutation = useMutation({
    mutationFn: () => groupsApi.leave(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", slug] })
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      Swal.fire({
        icon: "info",
        title: "Left Group",
        text: `You've left ${group?.name}`,
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (err: any) => {
      Swal.fire("Error", err.message || "Failed to leave group", "error")
    },
  })

  const createThreadMutation = useMutation({
    mutationFn: (data: {
      categorySlug: string
      title: string
      content: string
      county_id?: number
    }) =>
      forumApi.threads.create(data.categorySlug, {
        title: data.title,
        content: data.content,
        county_id: data.county_id,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["group", slug] })
      setDialogOpen(false)
      setNewThread({ title: "", content: "", category_slug: "" })
      Swal.fire({
        icon: "success",
        title: "Topic Created!",
        timer: 1500,
        showConfirmButton: false,
      })
      router.push(`/forum/threads/${res.data.slug}`)
    },
    onError: (err: any) => {
      Swal.fire("Error", err.message || "Failed to create topic", "error")
    },
  })

  const handleCreateThread = () => {
    if (
      !newThread.title.trim() ||
      !newThread.content.trim() ||
      !newThread.category_slug
    )
      return

    createThreadMutation.mutate({
      categorySlug: newThread.category_slug,
      title: newThread.title,
      content: newThread.content,
      county_id: group?.county_id || undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <ForumSidebar className="hidden lg:block" />
          <main className="flex-1">
            <Skeleton className="mb-4 h-8 w-48" />
            <Skeleton className="h-64 rounded-xl" />
          </main>
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <ForumSidebar className="hidden lg:block" />
          <main className="flex-1 py-12 text-center">
            <p className="text-destructive">
              Group not found or error loading.
            </p>
            <Button asChild className="mt-4">
              <Link href="/forum">Back to Forum</Link>
            </Button>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <ForumSidebar className="hidden lg:block" />

        {/* Main Content */}
        <main className="min-w-0 flex-1 space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/forum" className="hover:text-foreground">
              Forum
            </Link>
            <span>/</span>
            <Link href="/forum/groups" className="hover:text-foreground">
              Group
            </Link>
            <span>/</span>
            <span className="text-foreground">{group.name}</span>
          </div>

          {/* Group Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{group.name}</CardTitle>
                  <p className="mt-1 text-muted-foreground">
                    {group.description}
                  </p>
                </div>
                {isAuthenticated && (
                  <div className="flex gap-2">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="mr-2 h-4 w-4" /> New Topic
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Start a Local Discussion</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select
                              value={newThread.category_slug}
                              onValueChange={(val) =>
                                setNewThread({
                                  ...newThread,
                                  category_slug: val,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category..." />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat: any) => (
                                  <SelectItem key={cat.id} value={cat.slug}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              value={newThread.title}
                              onChange={(e) =>
                                setNewThread({
                                  ...newThread,
                                  title: e.target.value,
                                })
                              }
                              placeholder="What's on your mind?"
                            />
                          </div>

                          <div>
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                              id="content"
                              rows={5}
                              value={newThread.content}
                              onChange={(e) =>
                                setNewThread({
                                  ...newThread,
                                  content: e.target.value,
                                })
                              }
                              placeholder="Write your message..."
                            />
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              This topic will be automatically tagged with{" "}
                              <strong>{group.county?.name} County</strong>.
                            </p>
                          </div>

                          <Button
                            onClick={handleCreateThread}
                            disabled={
                              createThreadMutation.isPending ||
                              !newThread.title.trim() ||
                              !newThread.content.trim() ||
                              !newThread.category_slug
                            }
                            className="w-full"
                          >
                            {createThreadMutation.isPending
                              ? "Creating..."
                              : "Create Topic"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {group.is_member ? (
                      <Button
                        variant="ghost"
                        onClick={() => leaveMutation.mutate()}
                        disabled={leaveMutation.isPending}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {leaveMutation.isPending ? "Leaving..." : "Leave Group"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => joinMutation.mutate()}
                        disabled={joinMutation.isPending}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        {joinMutation.isPending ? "Joining..." : "Join Group"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {group.member_count} members
                </span>
                {group.county && (
                  <Badge variant="secondary">
                    <MapPin className="mr-1 h-3 w-3" />
                    {group.county.name} County
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Members Grid */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  Members ({group.member_count})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.members?.slice(0, 10).map((member: any) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            member.profile_picture ??
                            "/images/default-avatar.png"
                          }
                        />
                        <AvatarFallback>
                          {member.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {member.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined{" "}
                          {format(new Date(member.joined_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {group.member_count > 10 && (
                  <Link
                    href={`/forum/groups/${slug}/members`}
                    className="mt-4 block text-sm text-primary hover:underline"
                  >
                    View all members →
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Recent Local Discussions */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3 text-right">
                <CardTitle className="flex items-center gap-2 text-left text-base">
                  <MessageSquare className="h-4 w-4" />
                  Recent Local Discussions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {group.recent_discussions?.length > 0 ? (
                  <div className="space-y-3">
                    {group.recent_discussions.map((thread: any) => (
                      <Link
                        key={thread.id}
                        href={`/forum/threads/${thread.slug}`}
                        className="block rounded-lg border border-transparent p-3 transition-colors hover:border-muted-foreground/10 hover:bg-muted"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {thread.title}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              by {thread.user?.username} in{" "}
                              <span className="font-medium text-primary">
                                {thread.category?.name}
                              </span>
                            </p>
                          </div>
                          <div className="ml-4 whitespace-nowrap text-[10px] text-muted-foreground">
                            {format(new Date(thread.created_at), "MMM d")}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed py-12 text-center text-muted-foreground">
                    <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-20" />
                    <p className="font-medium">No local discussions yet.</p>
                    <p className="mt-1 text-xs">
                      Start a topic tagged with {group.county?.name} to see it
                      here.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setDialogOpen(true)}
                    >
                      Start First Topic
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
