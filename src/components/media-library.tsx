"use client"

import { useState, useRef } from "react"
import { useMedia, useUploadMedia, useDeleteMedia } from "@/hooks/useMedia"
import { Media } from "@/types/index"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { formatBytes } from "@/lib/utils"
import { Trash, Upload, File as FileIcon, Image as ImageIcon, Copy, Check } from "lucide-react"
import Swal from "sweetalert2"
import Image from "next/image"

interface MediaLibraryProps {
  onSelect?: (media: Media) => void
}

export function MediaLibrary({ onSelect }: MediaLibraryProps) {
  const isLocal = process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("localhost") || 
                  process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("127.0.0.1")
  const { data: media = [], isLoading } = useMedia()
  const uploadMut = useUploadMedia()
  const deleteMut = useDeleteMedia()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Basic validation
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      Swal.fire("Error", "File size must be less than 10MB", "error")
      return
    }

    try {
      await uploadMut.mutateAsync(file)
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'File uploaded successfully',
        showConfirmButton: false,
        timer: 3000
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? "Failed to upload file")
      Swal.fire("Error", message, "error")
    } finally {
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete File?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete",
    })

    if (result.isConfirmed) {
      try {
        await deleteMut.mutateAsync(id)
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'File deleted',
          showConfirmButton: false,
          timer: 2000
        })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err ?? "Failed to delete file")
        Swal.fire("Error", message || "Failed to delete file", "error")
      }
    }
  }

  const copyUrl = (url: string, id: number) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">My Media</h3>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,application/pdf"
          />
          <Button onClick={handleUploadClick} disabled={uploadMut.isPending}>
            {uploadMut.isPending ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload File
          </Button>
        </div>
      </div>

      <div className="min-h-[200px] border rounded-md p-4 bg-muted/10">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
             <ImageIcon className="h-10 w-10 mb-2 opacity-20" />
             <p>No media files found.</p>
             <p className="text-sm">Upload images or documents to use them in your posts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {media.map((file) => (
              <Card key={file.id} className="overflow-hidden group relative">
                <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                   {file.mime_type.startsWith("image/") ? (
                     <div className="relative w-full h-full">
                       <Image 
                         src={file.original_url} 
                         alt={file.name}
                         fill
                         className="object-cover"
                         sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                       />
                     </div>
                   ) : (
                     <FileIcon className="h-12 w-12 text-muted-foreground" />
                   )}
                   
                   {/* Overlay Actions */}
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      {onSelect && (
                        <Button size="sm" variant="secondary" className="w-full" onClick={() => onSelect(file)}>
                          Select
                        </Button>
                      )}
                      <div className="flex gap-2 w-full justify-center">
                         <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => copyUrl(file.original_url, file.id)} title="Copy URL">
                            {copiedId === file.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                         </Button>
                         <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-500/20 hover:text-red-400" onClick={() => handleDelete(file.id)} title="Delete">
                            <Trash className="h-4 w-4" />
                         </Button>
                      </div>
                   </div>
                </div>
                <CardContent className="p-3">
                   <div className="truncate text-sm font-medium" title={file.file_name}>{file.file_name}</div>
                   <div className="text-xs text-muted-foreground flex justify-between mt-1">
                      <span>{formatBytes ? formatBytes(file.size) : `${Math.round(file.size / 1024)} KB`}</span>
                      <span>{file.mime_type.split('/')[1].toUpperCase()}</span>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
