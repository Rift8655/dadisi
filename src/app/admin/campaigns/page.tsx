"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { campaignAdminApi } from "@/lib/api-admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Globe,
  Lock,
  CheckCircle,
} from "lucide-react"
import type { DonationCampaign } from "@/schemas/campaign"
import Swal from "sweetalert2"

interface CampaignListResponse {
  success: boolean
  data: DonationCampaign[]
  pagination: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

export default function AdminCampaignsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)

  const { data, isLoading: loading } = useQuery({
    queryKey: ["admin-campaigns", page, searchQuery],
    queryFn: () => campaignAdminApi.list({
      page,
      search: searchQuery || undefined,
    }) as Promise<CampaignListResponse>,
  })

  const campaigns = data?.data ?? []
  const total = data?.pagination?.total ?? 0
  const lastPage = data?.pagination?.last_page ?? 1

  const invalidateCampaigns = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] })
  }

  const publishMutation = useMutation({
    mutationFn: (slug: string) => campaignAdminApi.publish(slug),
    onSuccess: () => {
      Swal.fire({ icon: "success", title: "Campaign published!", timer: 1500 })
      invalidateCampaigns()
    },
    onError: (error: any) => Swal.fire("Error", error.message || "Failed to publish", "error"),
  })

  const unpublishMutation = useMutation({
    mutationFn: (slug: string) => campaignAdminApi.unpublish(slug),
    onSuccess: () => {
      Swal.fire({ icon: "success", title: "Campaign unpublished!", timer: 1500 })
      invalidateCampaigns()
    },
    onError: (error: any) => Swal.fire("Error", error.message || "Failed to unpublish", "error"),
  })

  const completeMutation = useMutation({
    mutationFn: (slug: string) => campaignAdminApi.complete(slug),
    onSuccess: () => {
      Swal.fire({ icon: "success", title: "Campaign completed!", timer: 1500 })
      invalidateCampaigns()
    },
    onError: (error: any) => Swal.fire("Error", error.message || "Failed to complete", "error"),
  })

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => campaignAdminApi.delete(slug),
    onSuccess: () => {
      Swal.fire({ icon: "success", title: "Campaign deleted!", timer: 1500 })
      invalidateCampaigns()
    },
    onError: (error: any) => Swal.fire("Error", error.message || "Failed to delete", "error"),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setSearchQuery(search)
  }

  const handlePublish = (slug: string) => publishMutation.mutate(slug)
  const handleUnpublish = (slug: string) => unpublishMutation.mutate(slug)

  const handleComplete = async (slug: string) => {
    const result = await Swal.fire({
      title: "Mark as Completed?",
      text: "This will mark the campaign as completed. Donors can no longer contribute.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, complete it",
    })
    if (result.isConfirmed) completeMutation.mutate(slug)
  }

  const handleDelete = async (slug: string) => {
    const result = await Swal.fire({
      title: "Delete Campaign?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    })
    if (result.isConfirmed) deleteMutation.mutate(slug)
  }

  const formatCurrency = (amount: number | null, currency: string) => {
    if (amount === null) return "—"
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      draft: "secondary",
      completed: "outline",
      cancelled: "destructive",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donation Campaigns</h1>
          <p className="text-muted-foreground">
            Manage fundraising campaigns for the organization.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/campaigns/new">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No campaigns found.</p>
              <Button asChild className="mt-4">
                <Link href="/admin/campaigns/new">Create Your First Campaign</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Goal</TableHead>
                  <TableHead className="text-right">Raised</TableHead>
                  <TableHead className="text-right">Progress</TableHead>
                  <TableHead className="text-right">Donors</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{campaign.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {campaign.short_description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(campaign.goal_amount, campaign.currency)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(campaign.current_amount, campaign.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.goal_amount ? `${campaign.progress_percentage}%` : "—"}
                    </TableCell>
                    <TableCell className="text-right">{campaign.donor_count}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/campaigns/${campaign.slug}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Public
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/campaigns/${campaign.slug}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {campaign.status === "draft" && (
                            <DropdownMenuItem onClick={() => handlePublish(campaign.slug)}>
                              <Globe className="h-4 w-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          {campaign.status === "active" && (
                            <>
                              <DropdownMenuItem onClick={() => handleUnpublish(campaign.slug)}>
                                <Lock className="h-4 w-4 mr-2" />
                                Unpublish
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleComplete(campaign.slug)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(campaign.slug)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
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
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {lastPage} ({total} campaigns)
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page >= lastPage}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
