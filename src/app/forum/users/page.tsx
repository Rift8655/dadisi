"use client"

import Link from "next/link"
import { ArrowLeft, Users, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ForumSidebar } from "@/components/forum/ForumSidebar"

export default function UsersPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex gap-8">
        <ForumSidebar className="hidden lg:block" />
        
        <main className="flex-1 min-w-0">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/forum">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Forum
            </Link>
          </Button>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                Community Members
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Discover active community members and top contributors.
              </p>
            </div>

            <Card className="border-dashed border-2 bg-muted/30">
              <CardContent className="py-20 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <UserCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  The community members directory is being built. Soon you'll be able 
                  to find and connect with other Dadisi members.
                </p>
                <Button asChild variant="outline">
                  <Link href="/forum">Browse Categories</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
