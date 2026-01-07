"use client"

import Link from "next/link"
import { format } from "date-fns"
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  History,
  Mail,
  User,
  Zap,
} from "lucide-react"

import { useAdminSubscription } from "@/hooks/useAdminSubscriptions"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

interface SubscriptionDetailsDialogProps {
  subscriptionId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionDetailsDialog({
  subscriptionId,
  open,
  onOpenChange,
}: SubscriptionDetailsDialogProps) {
  const { data: subscription, isLoading } = useAdminSubscription(
    subscriptionId as number
  )

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "success" | "warning" | "destructive" | "secondary" | "outline"
    > = {
      active: "success",
      expired: "destructive",
      canceled: "secondary",
      pending: "warning",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Subscription Details</DialogTitle>
          <DialogDescription>
            Detailed view of member subscription status and history.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : subscription ? (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Subscriber Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">
                      {subscription.subscriber?.member_profile?.first_name}{" "}
                      {subscription.subscriber?.member_profile?.last_name}
                    </h4>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{subscription.subscriber?.email}</span>
                      </div>
                      <Link
                        href={`/admin/users/${subscription.subscriber_id}`}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                        onClick={() => onOpenChange(false)}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>View User Profile</span>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(subscription.status)}
                  <p className="mt-1 text-xs text-muted-foreground">
                    ID: #{subscription.id}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Plan Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Plan
                  </p>
                  <p className="font-medium">{subscription.plan?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Billing Cycle
                  </p>
                  <p className="font-medium capitalize">
                    {Number(subscription.plan?.price) === 0
                      ? "N/A"
                      : subscription.plan?.invoice_period === "1"
                        ? subscription.plan?.invoice_interval === "month"
                          ? "Monthly"
                          : subscription.plan?.invoice_interval === "year"
                            ? "Yearly"
                            : `${subscription.plan?.invoice_period} ${subscription.plan?.invoice_interval}(s)`
                        : subscription.plan?.invoice_period === "1l" ||
                            subscription.plan?.invoice_period
                              ?.toString()
                              .includes("y")
                          ? "Yearly"
                          : subscription.plan?.invoice_period === "1m" ||
                              subscription.plan?.invoice_period
                                ?.toString()
                                .includes("m")
                            ? "Monthly"
                            : subscription.plan?.invoice_period
                                ?.toString()
                                .replace("ly", "ly") || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Amount
                  </p>
                  <p className="font-medium">
                    {subscription.plan?.currency} {subscription.plan?.price}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Auto-Renew
                  </p>
                  <div className="flex items-center gap-1.5 font-medium">
                    {subscription.subscriber?.renewal_preferences
                      ?.renewal_type === "automatic" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Enabled</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Disabled</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="rounded-lg bg-muted p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Started
                      </span>
                      <span className="text-sm font-medium">
                        {subscription.starts_at
                          ? format(new Date(subscription.starts_at), "PPP")
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Expires
                      </span>
                      <span className="text-sm font-medium">
                        {subscription.expires_at
                          ? format(new Date(subscription.expires_at), "PPP")
                          : "Never"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-3">
                <h5 className="flex items-center gap-2 font-semibold">
                  <CreditCard className="h-4 w-4" />
                  Payment History
                </h5>
                <div className="space-y-2">
                  {subscription.payments && subscription.payments.length > 0 ? (
                    subscription.payments.map((payment: any) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-md border p-3 text-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {payment.currency} {payment.amount}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Ref:{" "}
                            {payment.reference ||
                              payment.order_reference ||
                              "N/A"}
                          </span>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              payment.status === "paid" ? "success" : "outline"
                            }
                            className="text-[10px]"
                          >
                            {payment.status}
                          </Badge>
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {format(
                              new Date(payment.created_at),
                              "MMM d, yyyy"
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No payment records found.
                    </p>
                  )}
                </div>
              </div>

              {/* History Section */}
              <div className="space-y-3">
                <h5 className="flex items-center gap-2 font-semibold">
                  <History className="h-4 w-4" />
                  Subscription History
                </h5>
                <div className="space-y-3 rounded-md border p-3">
                  {subscription.audit_logs &&
                  subscription.audit_logs.length > 0 ? (
                    subscription.audit_logs.map((log: any) => (
                      <div
                        key={log.id}
                        className="relative pl-4 before:absolute before:left-0 before:top-1.5 before:h-2 before:w-2 before:rounded-full before:bg-primary/30"
                      >
                        <p className="text-sm font-medium">
                          {log.action.replace(/_/g, " ")}
                        </p>
                        {log.notes && (
                          <p className="text-xs text-muted-foreground">
                            {log.notes}
                          </p>
                        )}
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {format(
                            new Date(log.created_at),
                            "MMM d, yyyy HH:mm"
                          )}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm italic text-muted-foreground">
                      No history recorded yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Enhancements */}
              {subscription.enhancements &&
                subscription.enhancements.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="flex items-center gap-2 font-semibold">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      Active Enhancements
                    </h5>
                    <div className="space-y-2">
                      {subscription.enhancements.map((enh: any) => (
                        <div
                          key={enh.id}
                          className="flex items-center justify-between rounded-md border p-2 text-sm"
                        >
                          <span className="font-medium">{enh.name}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {enh.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            Subscription not found or deleted.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
