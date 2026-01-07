"use client"

import { useState } from "react"
import Image from "next/image"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Upload, X } from "lucide-react"

import { api, mediaApi } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MediaLibraryGrid from "@/components/media/MediaLibrary"

import { FeaturedImageUpload } from "./FeaturedImageUpload"

interface Media {
  id: number
  url: string
  original_url?: string
  file_name?: string
  mime_type?: string
  size: number
}

interface MediaGallerySelectorProps {
  selectedIds: number[]
  onChange: (ids: number[]) => void
  excludeId?: number // Exclude featured image from gallery selection
}

export function MediaGallerySelector({
  selectedIds,
  onChange,
  excludeId,
}: MediaGallerySelectorProps) {
  const [activeTab, setActiveTab] = useState<"select" | "upload">("select")
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: media, isLoading } = useQuery({
    queryKey: ["media"],
    queryFn: () => mediaApi.list(),
  })

  // Ensure media is an array
  const mediaList = Array.isArray(media) ? media : []

  const availableMedia = mediaList.filter(
    (m: any) => m.mime_type?.startsWith("image/") && m.id !== excludeId
  )

  const toggleMedia = (mediaId: number) => {
    if (selectedIds.includes(mediaId)) {
      onChange(selectedIds.filter((id) => id !== mediaId))
    } else {
      onChange([...selectedIds, mediaId])
    }
  }

  const selectedMedia = mediaList.filter((m: any) => selectedIds.includes(m.id))

  const handleUploadSuccess = (mediaId: number) => {
    queryClient.invalidateQueries({ queryKey: ["media"] })
    onChange([...selectedIds, mediaId])
    setActiveTab("select")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Gallery Images</span>
          <Badge variant="secondary">{selectedIds.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Images Preview */}
        {selectedMedia.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {selectedMedia.map((item) => (
              <div key={item.id} className="group relative aspect-video">
                <Image
                  src={item.original_url || item.url || ""}
                  alt={item.file_name || "Gallery image"}
                  fill
                  className="rounded-md object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => toggleMedia(item.id)}
                  className="absolute right-1 top-1 rounded-full bg-destructive p-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3 text-destructive-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Images Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setIsOpen(true)}
        >
          <Upload className="mr-2 h-4 w-4" />
          {selectedMedia.length > 0
            ? "Manage Gallery"
            : "Add Images to Gallery"}
        </Button>

        {/* Media Selection Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col">
            <DialogHeader>
              <DialogTitle>Select Gallery Images</DialogTitle>
            </DialogHeader>

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className="flex flex-1 flex-col"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <TabsList>
                  <TabsTrigger value="select">Select from Library</TabsTrigger>
                  <TabsTrigger value="upload">Upload New</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="select" className="mt-4 min-h-0 flex-1">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                  </div>
                ) : (
                  <MediaLibraryGrid
                    media={availableMedia}
                    selectedIds={selectedIds}
                    onToggle={toggleMedia}
                    excludeId={excludeId}
                  />
                )}
              </TabsContent>

              <TabsContent value="upload" className="mt-4 flex-1">
                <div className="flex min-h-[40vh] items-center justify-center rounded-lg border-2 border-dashed p-4">
                  <div className="w-full max-w-md">
                    <FeaturedImageUpload
                      value=""
                      onChange={(_, id) => {
                        if (id && id > 0) {
                          handleUploadSuccess(id)
                        }
                      }}
                      noCard={true}
                      showLibraryButton={false}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-auto flex justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                {selectedIds.length} image{selectedIds.length !== 1 ? "s" : ""}{" "}
                selected
              </p>
              <Button onClick={() => setIsOpen(false)}>Done</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
