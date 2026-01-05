"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import {
  Check,
  Copy,
  Eye,
  File as FileIcon,
  Globe,
  Image as ImageIcon,
  Lock,
  MoreVertical,
  Pencil,
  Share2,
  Trash,
  Upload,
} from "lucide-react"
import Swal from "sweetalert2"

import { Media } from "@/types/index"
import { formatBytes } from "@/lib/utils"
import {
  useDeleteMedia,
  useMedia,
  useRenameMedia,
  useUpdateMediaVisibility,
  useUploadMedia,
} from "@/hooks/useMedia"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Icons } from "@/components/icons"

interface MediaLibraryProps {
  onSelect?: (media: Media) => void
}

export function MediaLibrary({ onSelect }: MediaLibraryProps) {
  const { data: mediaData, isLoading } = useMedia()
  const media = mediaData?.data || []
  const uploadMut = useUploadMedia()
  const deleteMut = useDeleteMedia()
  const renameMut = useRenameMedia()
  const visibilityMut = useUpdateMediaVisibility()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // Rename Dialog State
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [renameFile, setRenameFile] = useState<Media | null>(null)
  const [newName, setNewName] = useState("")

  // Visibility Dialog State
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false)
  const [visibilityFile, setVisibilityFile] = useState<Media | null>(null)
  const [newVisibility, setNewVisibility] = useState<
    "public" | "private" | "shared"
  >("private")
  const [allowDownload, setAllowDownload] = useState(true)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Basic validation
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      Swal.fire("Error", "File size must be less than 10MB", "error")
      return
    }

    try {
      await uploadMut.mutateAsync(file)
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "File uploaded successfully",
        showConfirmButton: false,
        timer: 3000,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : String(err ?? "Failed to upload file")
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
          position: "top-end",
          icon: "success",
          title: "File deleted",
          showConfirmButton: false,
          timer: 2000,
        })
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : String(err ?? "Failed to delete file")
        Swal.fire("Error", message || "Failed to delete file", "error")
      }
    }
  }

  const copyUrl = (url: string, id: number) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRenameClick = (file: Media) => {
    setRenameFile(file)
    setNewName(file.file_name || "")
    setIsRenameOpen(true)
  }

  const handleRenameSubmit = async () => {
    if (!renameFile || !newName.trim()) return

    try {
      await renameMut.mutateAsync({ id: renameFile.id, name: newName.trim() })
      setIsRenameOpen(false)
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "File renamed",
        showConfirmButton: false,
        timer: 2000,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : String(err ?? "Failed to rename file")
      Swal.fire("Error", message, "error")
    }
  }

  const handleVisibilityClick = (file: Media) => {
    setVisibilityFile(file)
    setNewVisibility(file.visibility || "private")
    setAllowDownload(file.allow_download ?? true)
    setIsVisibilityOpen(true)
  }

  const handleVisibilitySubmit = async () => {
    if (!visibilityFile) return

    try {
      await visibilityMut.mutateAsync({
        id: visibilityFile.id,
        visibility: newVisibility,
        allow_download: allowDownload,
      })
      setIsVisibilityOpen(false)
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Visibility updated",
        showConfirmButton: false,
        timer: 2000,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : String(err ?? "Failed to update visibility")
      Swal.fire("Error", message, "error")
    }
  }

  const getVisibilityIcon = (visibility?: string) => {
    switch (visibility) {
      case "public":
        return <Globe className="h-3 w-3" />
      case "shared":
        return <Share2 className="h-3 w-3" />
      default:
        return <Lock className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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

      <div className="min-h-[200px] rounded-md border bg-muted/10 p-4">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : media.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="mb-2 h-10 w-10 opacity-20" />
            <p>No media files found.</p>
            <p className="text-sm">
              Upload images or documents to use them in your posts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {media.map((file: Media) => (
              <Card key={file.id} className="group relative overflow-hidden">
                <div className="relative flex aspect-square items-center justify-center bg-gray-100 dark:bg-gray-800">
                  {file.mime_type?.startsWith("image/") ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={file.original_url || file.url}
                        alt={file.file_name || "Media file"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <FileIcon className="h-12 w-12 text-muted-foreground" />
                  )}

                  {/* Visibility Badge */}
                  <div
                    className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm"
                    title={`Visibility: ${file.visibility || "private"}`}
                  >
                    {getVisibilityIcon(file.visibility)}
                    <span className="capitalize">
                      {file.visibility || "private"}
                    </span>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute right-2 top-2 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-7 w-7 rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => handleRenameClick(file)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleVisibilityClick(file)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Visibility
                        </DropdownMenuItem>
                        {file.visibility === "shared" && (
                          <DropdownMenuItem
                            onClick={() =>
                              copyUrl(
                                `${window.location.origin}/media/shared/${file.share_token}`,
                                file.id
                              )
                            }
                          >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share Link
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(file.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Overlay Actions (Select, Copy URL) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    {(onSelect && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full"
                        onClick={() => onSelect(file)}
                      >
                        Select
                      </Button>
                    )) || (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full"
                        onClick={() =>
                          copyUrl(file.original_url || file.url, file.id)
                        }
                      >
                        {copiedId === file.id ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <CardContent className="p-3">
                  <div
                    className="truncate text-sm font-medium"
                    title={file.file_name || "Unknown file"}
                  >
                    {file.file_name || "Unknown file"}
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>{file.size ? formatBytes(file.size) : "0 KB"}</span>
                    <span>
                      {file.mime_type
                        ? file.mime_type.split("/")[1]?.toUpperCase()
                        : "UNKNOWN"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>
              Enter a new name for your file.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="filename">File Name</Label>
            <Input
              id="filename"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRenameSubmit}
              disabled={renameMut.isPending || !newName.trim()}
            >
              {renameMut.isPending && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Visibility Dialog */}
      <Dialog open={isVisibilityOpen} onOpenChange={setIsVisibilityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File Visibility</DialogTitle>
            <DialogDescription>
              Manage who can see and download this file.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Visibility Level</Label>
              <Select
                value={newVisibility}
                onValueChange={(val: "public" | "private" | "shared") =>
                  setNewVisibility(val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Private (Only you)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Public (Anyone with link)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="shared">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      <span>Shared (Link + Download Controls)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newVisibility === "shared" && (
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm">Allow Download</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow people with the share link to download the file.
                  </p>
                </div>
                <Switch
                  checked={allowDownload}
                  onCheckedChange={setAllowDownload}
                />
              </div>
            )}

            {newVisibility === "shared" && visibilityFile?.share_token && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-blue-600">
                  Share link is active
                </Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/media/shared/${visibilityFile.share_token}`}
                    className="bg-muted text-xs"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      copyUrl(
                        `${window.location.origin}/media/shared/${visibilityFile?.share_token}`,
                        visibilityFile?.id || 0
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsVisibilityOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVisibilitySubmit}
              disabled={visibilityMut.isPending}
            >
              {visibilityMut.isPending && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
