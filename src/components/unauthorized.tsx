"use client"

import Link from "next/link"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export interface UnauthorizedProps {
  title?: string
  message?: string
  action?: "redirect" | "stay"
  actionLabel?: string
  actionHref?: string
}

export function Unauthorized({
  title = "Access Denied",
  message = "You do not have permission to access this resource.",
  action = "redirect",
  actionLabel = "Go Back to Dashboard",
  actionHref = "/dashboard",
}: UnauthorizedProps) {
  return (
    <div className="flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-2">{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {action === "redirect" && actionHref ? (
            <Link href={actionHref} passHref>
              <Button>{actionLabel}</Button>
            </Link>
          ) : (
            <Button disabled>{actionLabel}</Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
