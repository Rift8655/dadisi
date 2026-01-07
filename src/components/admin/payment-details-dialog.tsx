"use client"

import Link from "next/link"
import { format } from "date-fns"
import {
  Calendar,
  CreditCard,
  DollarSign,
  ExternalLink,
  Hash,
  Info,
  User,
} from "lucide-react"

import { useAdminPayment } from "@/hooks/useAdminPayments"
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

interface PaymentDetailsDialogProps {
  paymentId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentDetailsDialog({
  paymentId,
  open,
  onOpenChange,
}: PaymentDetailsDialogProps) {
  const { data: payment, isLoading } = useAdminPayment(paymentId)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      paid: "success",
      pending: "warning",
      refunded: "destructive",
      failed: "destructive",
      canceled: "secondary",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden p-0">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about transaction{" "}
              {payment?.reference || payment?.order_reference || "..."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="space-y-4 p-6 pt-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : payment ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {payment.currency} {payment.amount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(payment.created_at), "PPP p")}
                    </p>
                  </div>
                </div>
                <div>{getStatusBadge(payment.status)}</div>
              </div>

              <Separator />

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Payer Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <User className="h-4 w-4" />
                    Payer Information
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {payment.payer?.name || "Guest"}
                      </p>
                      {payment.payer_id ? (
                        <Badge
                          variant="secondary"
                          className="h-4 bg-blue-100 text-[9px] font-bold uppercase text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          User
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="h-4 text-[9px] font-bold uppercase text-muted-foreground"
                        >
                          Guest
                        </Badge>
                      )}
                      {payment.payer && (
                        <Link
                          href={`/admin/users/${payment.payer.id}`}
                          className="text-primary transition-colors hover:text-primary/80"
                          title="View user profile"
                          onClick={() => onOpenChange(false)}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {payment.payer?.email ||
                        payment.meta?.user_email ||
                        "No email available"}
                    </p>
                    {(payment.county || payment.meta?.county) && (
                      <p className="mt-1 text-xs capitalize text-muted-foreground">
                        County: {payment.county || payment.meta?.county}
                      </p>
                    )}
                  </div>
                </div>

                {/* Transaction Context */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Info className="h-4 w-4" />
                    Payment Context
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                    <p>
                      <span className="font-normal text-muted-foreground">
                        Type:
                      </span>{" "}
                      <span className="capitalize">
                        {payment.payable_type
                          ?.split("\\")
                          .pop()
                          ?.replace("Order", "") || "Standard Payment"}
                      </span>
                    </p>
                    <p className="mt-1">
                      <span className="font-normal text-muted-foreground">
                        Method:
                      </span>{" "}
                      <span className="capitalize">
                        {payment.method || "N/A"}
                      </span>
                    </p>
                    <p className="mt-1">
                      <span className="font-normal text-muted-foreground">
                        Gateway:
                      </span>{" "}
                      <span className="capitalize">
                        {payment.gateway || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Reference IDs */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  Identifiers
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border p-3 text-sm">
                    <p className="text-xs uppercase text-muted-foreground">
                      Reference
                    </p>
                    <p className="mt-1 select-all break-all font-mono">
                      {payment.reference || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3 text-sm">
                    <p className="text-xs uppercase text-muted-foreground">
                      Order Ref
                    </p>
                    <p className="mt-1 select-all break-all font-mono">
                      {payment.order_reference || "N/A"}
                    </p>
                  </div>
                  {(payment.external_reference ||
                    payment.meta?.tracking_id) && (
                    <div className="col-span-full rounded-lg border p-3 text-sm">
                      <p className="text-xs uppercase text-muted-foreground">
                        External Tracking ID (PesaPal)
                      </p>
                      <p className="mt-1 select-all break-all font-mono">
                        {payment.external_reference ||
                          payment.meta?.tracking_id}
                      </p>
                    </div>
                  )}
                  {payment.transaction_id && (
                    <div className="col-span-full rounded-lg border p-3 text-sm">
                      <p className="text-xs uppercase text-muted-foreground">
                        Transaction ID
                      </p>
                      <p className="mt-1 select-all break-all font-mono">
                        {payment.transaction_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Meta / Additional Data */}
              {payment.meta && Object.keys(payment.meta).length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      Technical Details
                    </div>
                    <pre className="max-h-60 overflow-auto rounded-lg bg-muted p-4 font-mono text-xs">
                      {JSON.stringify(payment.meta, null, 2)}
                    </pre>
                  </div>
                </>
              )}

              {payment.receipt_url && (
                <div className="pt-2">
                  <a
                    href={payment.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Original Receipt
                  </a>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            Payment not found or error loading details.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
