"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  ArrowLeft,
  Pin,
  Lock,
  MessageSquare,
  Eye,
  Plus,
  User,
  MapPin,
} from "lucide-react"
import { type ForumThread } from "@/schemas/forum"
import { countiesApi } from "@/lib/api"
import { useAuth } from "@/store/auth"
import {
  useForumCategory,
  useCreateThread,
} from "@/hooks/useForum"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ForumSidebar } from "@/components/forum/ForumSidebar"
import Swal from "sweetalert2"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params)
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newThread, setNewThread] = useState({ title: "", content: "", county_id: "" })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch category data using hook
  const { data: category, isLoading, error } = useForumCategory(slug)

  // Fetch counties for the county selector in the dialog (public API)
  const { data: countiesData } = useQuery({
    queryKey: ["counties"],
    queryFn: () => countiesApi.list(),
  })
  const counties = countiesData ?? []

  const createMutation = useCreateThread()

  const handleCreateThread = () => {
    if (!category || !newThread.title.trim() || !newThread.content.trim()) return
    
    createMutation.mutate({
      categorySlug: slug,
      data: {
        title: newThread.title,
        content: newThread.content,
        county_id: newThread.county_id ? parseInt(newThread.county_id) : undefined,
      },
    }, {
      onSuccess: (res) => {
        setDialogOpen(false)
        setNewThread({ title: "", content: "", county_id: "" })
        Swal.fire({
          icon: "success",
          title: "Topic created!",
          timer: 1500,
          showConfirmButton: false,
        })
        router.push(`/forum/threads/${res.data.slug}`)
      },
      onError: (err: any) => {
        Swal.fire("Error", err.message || "Failed to create topic", "error")
      },
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex gap-8">
          <ForumSidebar className="hidden lg:block" />
          <main className="flex-1">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-96 mb-8" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex gap-8">
          <ForumSidebar className="hidden lg:block" />
          <main className="flex-1">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/forum">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Forum
              </Link>
            </Button>
            <p className="text-destructive font-medium">Category not found or failed to load.</p>
          </main>
        </div>
      </div>
    )
  }

  const threads = category.threads ?? []

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex gap-8">
        {/* Sidebar */}
        <ForumSidebar className="hidden lg:block" />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/forum" className="hover:text-foreground transition-colors">
              Forum
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
              <p className="text-muted-foreground mt-1 text-lg">{category.description}</p>
            </div>

            {mounted && isAuthenticated && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="shadow-lg">
                    <Plus className="h-5 w-5 mr-1" /> New Topic
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Create New Topic</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newThread.title}
                        onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                        placeholder="What is this discussion about?"
                      />
                    </div>
                    
                    {/* County Selector */}
                    <div className="space-y-2">
                      <Label htmlFor="county">County Tag (optional)</Label>
                      <Select
                        value={newThread.county_id}
                        onValueChange={(value) => setNewThread({ ...newThread, county_id: value })}
                      >
                        <SelectTrigger id="county">
                          <SelectValue placeholder="Select a county..." />
                        </SelectTrigger>
                        <SelectContent>
                          {counties.map((county: { id: number; name: string }) => (
                            <SelectItem key={county.id} value={county.id.toString()}>
                              <span className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                {county.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Tagging your county helps local members find your discussion.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        rows={6}
                        value={newThread.content}
                        onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                        placeholder="Share your thoughts..."
                        className="resize-none"
                      />
                    </div>
                    <Button
                      onClick={handleCreateThread}
                      disabled={createMutation.isPending || !newThread.title.trim() || !newThread.content.trim()}
                      className="w-full py-6 text-base"
                    >
                      {createMutation.isPending ? "Creating..." : "Create Topic"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Thread List */}
          {threads.length === 0 ? (
            <Card className="border-dashed border-2 bg-muted/30">
              <CardContent className="py-20 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No topics yet</h3>
                <p className="text-muted-foreground mb-6">Be the first to start a conversation in {category.name}!</p>
                {mounted && isAuthenticated && (
                  <Button onClick={() => setDialogOpen(true)}>
                    Start a Discussion
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {threads?.map((thread: ForumThread) => (
                <Link key={thread.id} href={`/forum/threads/${thread.slug}`}>
                  <Card className="hover:border-primary/50 transition-all cursor-pointer group hover:shadow-md">
                    <CardContent className="py-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                          <AvatarImage src={thread.user?.profile_picture_path || "/images/default-avatar.png"} />
                          <AvatarFallback className="bg-primary/5 text-primary">
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {thread.is_pinned && (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-1.5 py-0">
                                <Pin className="h-3 w-3 mr-1" /> Pinned
                              </Badge>
                            )}
                            {thread.is_locked && (
                              <Badge variant="secondary" className="px-1.5 py-0">
                                <Lock className="h-3 w-3 mr-1" /> Locked
                              </Badge>
                            )}
                            {thread.county && (
                              <Badge variant="outline" className="px-2 py-0 border-primary/20 text-primary bg-primary/5">
                                <MapPin className="h-3 w-3 mr-1" /> {thread.county.name}
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors truncate">
                            {thread.title}
                          </h3>

                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                              {thread.user?.username || "Anonymous"}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <span>{format(new Date(thread.created_at), "MMM d, yyyy")}</span>
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-6 pr-2">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-foreground/80">{thread.reply_count ?? 0}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Replies</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-foreground/80">{thread.view_count ?? 0}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Views</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
