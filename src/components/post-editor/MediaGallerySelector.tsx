"use client"

import { useState } from "react"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { Check, Image as ImageIcon, Upload, X } from "lucide-react"

import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  const [isOpen, setIsOpen] = useState(false)

  const { data: mediaData, isLoading } = useQuery({
    queryKey: ["media"],
    queryFn: () => api.get<{ data: Media[] }>("/api/media"),
  })

  const media = mediaData?.data || []
  const availableMedia = media.filter(
    (m) => m.mime_type?.startsWith("image/") && m.id !== excludeId
  )

  const toggleMedia = (mediaId: number) => {
    if (selectedIds.includes(mediaId)) {
      onChange(selectedIds.filter((id) => id !== mediaId))
    } else {
      onChange([...selectedIds, mediaId])
    }
  }

  const selectedMedia = media.filter((m) => selectedIds.includes(m.id))

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
                  src={item.original_url || item.url}
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
          <DialogContent className="max-h-[80vh] max-w-4xl">
            <DialogHeader>
              <DialogTitle>Select Gallery Images</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                </div>
              ) : availableMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ImageIcon className="mb-4 h-12 w-12 opacity-20" />
                  <p>No images available</p>
                  <p className="text-sm">
                    Upload images to your media library first
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {availableMedia.map((item) => {
                    const isSelected = selectedIds.includes(item.id)
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "group relative aspect-video cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
                          isSelected
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-transparent hover:border-primary/50"
                        )}
                        onClick={() => toggleMedia(item.id)}
                      >
                        <Image
                          src={item.original_url || item.url}
                          alt={item.file_name || "Media"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                            <div className="rounded-full bg-primary p-2">
                              <Check className="h-5 w-5 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <p className="truncate text-xs text-white">
                            {item.file_name || "Untitled"}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
            <div className="flex justify-between border-t pt-4">
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
