"use client"

import Link from "next/link"
import type { Plan } from "@/schemas/plan"
import { Pencil, Plus, Trash } from "lucide-react"
import Swal from "sweetalert2"

import { useDeletePlan } from "@/hooks/useAdminPlans"
import { usePlans } from "@/hooks/usePlans"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"

export default function AdminPlansPage() {
  const { data: plans = [], isLoading } = usePlans()
  const deleteMut = useDeletePlan()

  const handleDeleteClick = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Plan?",
      text: "This action cannot be undone. Active subscriptions may be affected.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Delete",
    })

    if (result.isConfirmed) {
      try {
        await deleteMut.mutateAsync(id)
        Swal.fire("Deleted!", "Plan has been deleted.", "success")
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : String(err ?? "Failed to delete plan")
        Swal.fire("Error", message || "Failed to delete plan", "error")
      }
    }
  }

  return (
    <AdminDashboardShell title="Subscription Plans">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Manage Plans</h2>
            <p className="text-sm text-muted-foreground">
              Configure membership tiers, pricing, and features.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/plans/create">
              <Plus className="mr-2 h-4 w-4" /> Create Plan
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Plans</CardTitle>
            <CardDescription>
              List of all subscription plans available in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading plans...
              </div>
            ) : plans.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No plans found. Create one to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Promotions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((p: Plan) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {typeof p.name === "object" &&
                        p.name !== null &&
                        "en" in p.name
                          ? String(p.name.en)
                          : String(p.name || "Unnamed Plan")}
                        {p.interval && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({p.interval})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {p.pricing?.kes?.base_monthly
                          ? `KES ${p.pricing.kes.base_monthly}`
                          : `KES ${p.price || 0}`}
                      </TableCell>
                      <TableCell>
                        {p.is_active !== false ? (
                          <Badge
                            variant="outline"
                            className="border-green-200 bg-green-50 text-green-700"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-500"
                          >
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {(p.features || []).length} features
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {p.monthly_promotion || p.promotions?.monthly ? (
                            <Badge variant="secondary" className="text-xs">
                              Monthly -
                              {p.monthly_promotion?.discount_percent ||
                                p.promotions?.monthly?.discount_percent}
                              %
                            </Badge>
                          ) : null}
                          {p.yearly_promotion || p.promotions?.yearly ? (
                            <Badge variant="secondary" className="text-xs">
                              Yearly -
                              {p.yearly_promotion?.discount_percent ||
                                p.promotions?.yearly?.discount_percent}
                              %
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/plans/${p.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeleteClick(p.id)}
                          >
                            <Trash className="h-4 w-4" />
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
      </div>
    </AdminDashboardShell>
  )
}
