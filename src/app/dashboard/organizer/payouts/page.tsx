"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { api } from "@/lib/api"
import type { Payout } from "@/types"

export default function OrganizerPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEarned: 0,
    pending: 0,
    completed: 0,
    held: 0,
  })

  useEffect(() => {
    loadPayouts()
  }, [])

  const loadPayouts = async () => {
    setIsLoading(true)
    try {
      const response = await api.get<{ data: Payout[] }>("/api/payouts/my")
      const payoutsList = response.data || []
      setPayouts(payoutsList)
      
      // Calculate stats
      setStats({
        totalEarned: payoutsList.reduce((acc, p) => acc + p.net_payout, 0),
        pending: payoutsList.filter(p => p.status === "pending").reduce((acc, p) => acc + p.net_payout, 0),
        completed: payoutsList.filter(p => p.status === "completed").reduce((acc, p) => acc + p.net_payout, 0),
        held: payoutsList.filter(p => new Date(p.hold_until) > new Date()).reduce((acc, p) => acc + p.net_payout, 0),
      })
    } catch (error) {
      console.error("Failed to load payouts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (payout: Payout) => {
    const isHeld = new Date(payout.hold_until) > new Date()
    
    switch (payout.status) {
      case "completed":
        return <Badge className="bg-green-500 text-white">Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-500 text-white">Processing</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "pending":
        if (isHeld) {
          return <Badge variant="secondary">On Hold</Badge>
        }
        return <Badge className="bg-yellow-500 text-yellow-950">Pending</Badge>
      default:
        return <Badge variant="outline">{payout.status}</Badge>
    }
  }

  const formatCurrency = (amount: number, currency: string = "KES") => {
    return `${currency} ${amount.toLocaleString()}`
  }

  return (
    <UserDashboardShell title="My Payouts">
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/dashboard/organizer/events">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
        </Button>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalEarned)}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.completed)}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500/5 border-yellow-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pending)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">On Hold</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(stats.held)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-600">About Payouts</p>
                <p className="text-muted-foreground mt-1">
                  Payouts are processed after the event ends and the hold period expires. 
                  A commission is deducted from each payout. Hold periods may vary based on 
                  event type and your trust level.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payouts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No payouts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create paid events to start earning.
                </p>
                <Button asChild>
                  <Link href="/dashboard/organizer/events/create">Create Event</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Net Payout</TableHead>
                    <TableHead>Hold Until</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-mono text-sm">
                        {payout.reference}
                      </TableCell>
                      <TableCell>
                        <Link 
                          href={`/dashboard/organizer/events/${payout.event_id}`}
                          className="hover:underline"
                        >
                          Event #{payout.event_id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(payout.total_revenue, payout.currency)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        -{formatCurrency(payout.commission_amount, payout.currency)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payout.net_payout, payout.currency)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(payout.hold_until), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{getStatusBadge(payout)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </UserDashboardShell>
  )
}
