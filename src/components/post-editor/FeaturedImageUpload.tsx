"use client"

import { useCallback, useRef, useState } from "react"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Star, Upload, X } from "lucide-react"
import { useDropzone } from "react-dropzone"

import { mediaApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button, Button as PlainButton } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import MediaLibraryGrid from "@/components/media/MediaLibrary"

// Type for media upload response
interface MediaUploadResponse {
  success: boolean
  message: string
  data: {
    id: number
    file_name: string
    file_path: string
    type: string
    mime_type: string
    file_size: number
    is_public: boolean
    url: string
  }
}

interface UploadedImage {
  id: number
  url: string
  file_name: string
  isFeatured: boolean
  isTemporary?: boolean
}

interface FeaturedImageUploadProps {
  value: string // current hero_image_path
  onChange: (path: string, mediaId?: number) => void
  onImagesChange?: (images: UploadedImage[]) => void // Deprecated prop, kept for compatibility if needed
  showLibraryButton?: boolean
  noCard?: boolean
}

export function FeaturedImageUpload({
  value,
  onChange,
  onImagesChange,
  showLibraryButton = true,
  noCard = false,
}: FeaturedImageUploadProps) {
  const isLocal =
    process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("localhost") ||
    process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("127.0.0.1")

  // Single image state
  const [image, setImage] = useState<UploadedImage | null>(() => {
    if (value) {
      return {
        id: 0,
        url: value,
        file_name: "Featured Image",
        isFeatured: true,
        isTemporary: false,
      }
    }
    return null
  })

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)

  // Update internal state if value prop changes externally (and differs from current state)
  if (value && (!image || image.url !== value)) {
    // Only if we don't have an ID-based image that matches this URL
    // This prevents overriding the full object with a dummy one on re-renders
    if (image?.url !== value) {
      setImage({
        id: 0,
        url: value,
        file_name: "Featured Image",
        isFeatured: true,
        isTemporary: false,
      })
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Enforce single file
      if (acceptedFiles.length === 0) return

      setUploading(true)
      setError(null)

      const file = acceptedFiles[0] // Take only the first file

      try {
        // Cleanup existing temporary image if about to replace it
        if (image?.isTemporary && image.id > 0) {
          mediaApi.delete(image.id).catch(console.error)
        }

        const formData = new FormData()
        formData.append("file", file)
        formData.append("temporary", "1")
        formData.append("attached_to", "post")

        const response = (await mediaApi.upload(
          formData
        )) as MediaUploadResponse

        if (response?.data) {
          const newImage = {
            id: response.data.id,
            url: response.data.url,
            file_name: response.data.file_name,
            isFeatured: true,
            isTemporary: true, // Marked as temporary
          }

          setImage(newImage)
          // Pass both URL (for legacy) and ID (for new system)
          onChange(response.data.url, response.data.id)

          // Deprecated hook
          onImagesChange?.([newImage])
        }
      } catch (err: any) {
        console.error("Upload failed:", err)
        setError(err.message || "Failed to upload image")
      } finally {
        setUploading(false)
      }
    },
    [onChange, onImagesChange, image]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1, // Enforce single file selection
    multiple: false,
  })

  const removeImage = async () => {
    try {
      // DELETE from server ONLY if it's a temporary upload
      if (image?.isTemporary && image.id > 0) {
        await mediaApi.delete(image.id)
      }

      setImage(null)
      onChange("", 0) // Clear value
      onImagesChange?.([])
    } catch (err: any) {
      console.error("Delete failed:", err)
      setError(err.message || "Failed to delete image")
    }
  }

  const content = (
    <div className="space-y-4">
      {image ? (
        // Single Image Preview
        <div className="relative overflow-hidden rounded-lg border-2 border-primary">
          <div className="relative aspect-video">
            <Image
              src={image.url}
              alt={image.file_name}
              fill
              unoptimized={isLocal}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>

          {/* Overlay with actions */}
          <div className="absolute right-2 top-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={removeImage}
              title="Remove"
            >
              <X className="h-4 w-4" />
            </Button>
            {showLibraryButton && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsLibraryOpen(true)}
                title="Select from library"
              >
                Library
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            )}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? "Drop image here..."
                    : "Drag & drop image or click to select"}
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP, GIF up to 5MB
                </p>
              </div>
            )}
          </div>

          {showLibraryButton && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsLibraryOpen(true)}
                disabled={uploading}
              >
                Select from Media Library
              </Button>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Recommendation */}
      <p className="text-xs text-muted-foreground">
        Recommended: 1200×630px for optimal social sharing
      </p>

      {/* Media Library Dialog for selecting existing images */}
      <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select from Media Library</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <MediaLibraryGrid
              onSelect={(m) => {
                // Cleanup existing temporary image if about to replace it
                if (image?.isTemporary && image.id > 0) {
                  mediaApi.delete(image.id).catch(console.error)
                }

                const newImage = {
                  id: m.id,
                  url: m.original_url || m.url || "",
                  file_name: m.file_name || "Featured Image",
                  isFeatured: true,
                  isTemporary: false, // Selected from library is NOT temporary
                }
                setImage(newImage)
                onChange(newImage.url, newImage.id)
                onImagesChange?.([newImage])
                setIsLibraryOpen(false)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  if (noCard) {
    return content
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Featured Image</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}
