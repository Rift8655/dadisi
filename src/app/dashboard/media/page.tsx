"use client"

import { MediaLibrary } from "@/components/media-library"
import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserMediaPage() {
  return (
    <UserDashboardShell title="Media Library">
      <div className="space-y-6">
        <div>
           <h3 className="text-lg font-medium">Manage Files</h3>
           <p className="text-sm text-muted-foreground">
             Upload and manage your images and documents used in blog posts and events.
           </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>My Uploads</CardTitle>
            <CardDescription>
              All files you have uploaded to the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MediaLibrary />
          </CardContent>
        </Card>
      </div>
    </UserDashboardShell>
  )
}
