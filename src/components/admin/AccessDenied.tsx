"use client"

import Link from "next/link"
import { ShieldAlert, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AccessDeniedProps {
  title?: string
  message?: string
  requiredPermission?: string
  backHref?: string
  backLabel?: string
}

export function AccessDenied({
  title = "Access Denied",
  message = "You don't have permission to access this page.",
  requiredPermission,
  backHref = "/admin",
  backLabel = "Back to Dashboard",
}: AccessDeniedProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="border-destructive/20 bg-destructive/5 max-w-md w-full">
        <CardContent className="py-16 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <ShieldAlert className="h-10 w-10 text-destructive/70" />
          </div>
          
          <h2 className="text-2xl font-semibold text-destructive">{title}</h2>
          
          <p className="text-muted-foreground mt-3 max-w-sm mx-auto">
            {message}
          </p>
          
          {requiredPermission && (
            <p className="text-sm text-muted-foreground mt-4">
              Required permission:{" "}
              <Badge variant="outline" className="ml-1">
                {requiredPermission}
              </Badge>
            </p>
          )}
          
          <Button variant="outline" className="mt-8" asChild>
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backLabel}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
