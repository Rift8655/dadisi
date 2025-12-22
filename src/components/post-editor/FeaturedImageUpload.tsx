"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { X, Upload, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { mediaApi } from "@/lib/api"

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
}

interface FeaturedImageUploadProps {
  value: string // current hero_image_path
  onChange: (path: string) => void
  onImagesChange?: (images: UploadedImage[]) => void
}

export function FeaturedImageUpload({
  value,
  onChange,
  onImagesChange,
}: FeaturedImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(() => {
    // Initialize with existing hero image if present
    if (value) {
      return [{ id: 0, url: value, file_name: "Current Image", isFeatured: true }]
    }
    return []
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true)
      setError(null)

      const newImages: UploadedImage[] = []

      for (const file of acceptedFiles) {
        try {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("temporary", "1") // Mark as temporary until post is saved
          formData.append("attached_to", "post")

          const response = await mediaApi.upload(formData) as MediaUploadResponse

          if (response?.data) {
            const isFirst = images.length === 0 && newImages.length === 0
            newImages.push({
              id: response.data.id,
              url: response.data.url,
              file_name: response.data.file_name,
              isFeatured: isFirst, // First image is featured by default
            })

            // If first image, set as hero
            if (isFirst) {
              onChange(response.data.url)
            }
          }
        } catch (err: any) {
          console.error("Upload failed:", err)
          setError(err.message || "Failed to upload image")
        }
      }

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages]
        setImages(updatedImages)
        onImagesChange?.(updatedImages)
      }

      setUploading(false)
    },
    [images, onChange, onImagesChange]
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
    multiple: true,
  })

  const setFeatured = (imageId: number) => {
    const updatedImages = images.map((img) => ({
      ...img,
      isFeatured: img.id === imageId,
    }))
    setImages(updatedImages)
    onImagesChange?.(updatedImages)

    const featured = updatedImages.find((img) => img.isFeatured)
    if (featured) {
      onChange(featured.url)
    }
  }

  const removeImage = async (imageId: number) => {
    try {
      // Only delete from server if it's a real uploaded image (id > 0)
      if (imageId > 0) {
        await mediaApi.delete(imageId)
      }

      const updatedImages = images.filter((img) => img.id !== imageId)

      // If removed image was featured, set first remaining as featured
      const wasFeatured = images.find((img) => img.id === imageId)?.isFeatured
      if (wasFeatured && updatedImages.length > 0) {
        updatedImages[0].isFeatured = true
        onChange(updatedImages[0].url)
      } else if (updatedImages.length === 0) {
        onChange("")
      }

      setImages(updatedImages)
      onImagesChange?.(updatedImages)
    } catch (err: any) {
      console.error("Delete failed:", err)
      setError(err.message || "Failed to delete image")
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Featured Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
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
                  ? "Drop images here..."
                  : "Drag & drop images or click to select"}
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP, GIF up to 5MB
              </p>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Image grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {images.map((image) => (
              <div
                key={image.id}
                className={cn(
                  "relative group rounded-lg overflow-hidden border-2",
                  image.isFeatured ? "border-primary" : "border-transparent"
                )}
              >
                <div className="aspect-video relative">
                  <Image
                    src={image.url}
                    alt={image.file_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 200px"
                  />
                </div>

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!image.isFeatured && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setFeatured(image.id)}
                      title="Set as featured"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage(image.id)}
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Featured badge */}
                {image.isFeatured && (
                  <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                    Featured
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Recommendation */}
        <p className="text-xs text-muted-foreground">
          Recommended: 1200×630px for optimal social sharing
        </p>
      </CardContent>
    </Card>
  )
}
