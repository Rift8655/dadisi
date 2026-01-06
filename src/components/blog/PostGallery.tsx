"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface GalleryImage {
  id: number
  url: string
  original_url?: string
  file_name?: string
}

interface PostGalleryProps {
  images: GalleryImage[]
  className?: string
}

export function PostGallery({ images, className }: PostGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return null
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") goToNext()
    if (e.key === "ArrowLeft") goToPrevious()
    if (e.key === "Escape") setLightboxOpen(false)
  }

  return (
    <>
      <div
        className={cn(
          "space-y-4 rounded-xl border bg-card p-6 shadow-sm",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold tracking-tight">Gallery</h3>
          {images.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {images.length} {images.length === 1 ? "image" : "images"}
            </p>
          )}
        </div>

        {/* Gallery Grid */}
        <div
          className={cn(
            "grid gap-3",
            images.length === 1 && "grid-cols-1",
            images.length === 2 && "grid-cols-2",
            images.length >= 3 && "grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          )}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-muted"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={image.original_url || image.url}
                alt={image.file_name || `Gallery image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
                <Maximize2 className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="h-[90vh] max-w-7xl p-0"
          onKeyDown={handleKeyDown}
        >
          <div className="relative flex h-full w-full items-center justify-center bg-black">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-50 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 z-50 h-12 w-12 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 z-50 h-12 w-12 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Image */}
            <div className="relative h-full w-full">
              <Image
                src={
                  images[currentIndex].original_url || images[currentIndex].url
                }
                alt={
                  images[currentIndex].file_name ||
                  `Gallery image ${currentIndex + 1}`
                }
                fill
                className="object-contain"
                unoptimized
                priority
              />
            </div>

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-sm">
                {currentIndex + 1} / {images.length}
              </div>
            )}

            {/* Image Title */}
            {images[currentIndex].file_name && (
              <div className="absolute bottom-16 left-1/2 z-50 max-w-md -translate-x-1/2 truncate rounded-lg bg-black/50 px-4 py-2 text-center text-sm text-white backdrop-blur-sm">
                {images[currentIndex].file_name}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
