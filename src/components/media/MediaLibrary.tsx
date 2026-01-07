"use client"

import Image from "next/image"
import { useQuery } from "@tanstack/react-query"

import { mediaApi } from "@/lib/api"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MediaItem {
  id: number
  url?: string
  original_url?: string
  file_name?: string
  mime_type?: string
}

interface MediaLibraryGridProps {
  onSelect?: (m: MediaItem) => void
  onToggle?: (id: number) => void
  selectedIds?: number[]
  excludeId?: number
  media?: MediaItem[] // optional pre-fetched media list
}

export function MediaLibraryGrid({
  onSelect,
  onToggle,
  selectedIds = [],
  excludeId,
  media: mediaProp,
}: MediaLibraryGridProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["media"],
    queryFn: () => mediaApi.list(),
    enabled: !mediaProp,
  })

  const dataArray = Array.isArray(data) ? data : []
  const media = (mediaProp || dataArray) as any[]

  const images = media.filter(
    (m: any) => m.mime_type?.startsWith("image/") && m.id !== excludeId
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No images available</p>
        <p className="text-sm">Upload images to your media library first</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[50vh] pr-4">
      <div className="grid grid-cols-3 gap-4">
        {images.map((item: any) => {
          const isSelected = selectedIds.includes(item.id)

          return (
            <button
              key={item.id}
              onClick={() => {
                if (onToggle) return onToggle(item.id)
                if (onSelect) return onSelect(item)
              }}
              className={`group relative aspect-video overflow-hidden rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-primary/50"
              }`}
            >
              <Image
                src={item.original_url || item.url || ""}
                alt={item.file_name || "Media"}
                fill
                className="object-cover"
                unoptimized
              />

              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                  <div className="rounded-full bg-primary p-2">
                    <svg
                      className="h-5 w-5 text-primary-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="truncate text-xs text-white">
                  {item.file_name || "Untitled"}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}

export default MediaLibraryGrid
