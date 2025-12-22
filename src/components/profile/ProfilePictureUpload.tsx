"use client"

import { useState, useRef, useEffect } from "react"
import { useUploadProfilePicture } from "@/hooks/useProfilePicture"
import { useAuth } from "@/store/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProfilePictureUploadSchema } from "@/schemas/user"
import { showError } from "@/lib/sweetalert"
import { Camera } from "lucide-react"

export function ProfilePictureUpload() {
  const { user } = useAuth()
  const { mutate: uploadPicture, isPending } = useUploadProfilePicture()
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset preview when user changes (e.g. successful upload updates user URL)
  useEffect(() => {
    if (user?.profile_picture_url) {
      setPreview(user.profile_picture_url)
    }
  }, [user?.profile_picture_url])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate using Zod schema
    const result = ProfilePictureUploadSchema.safeParse({ image: file })
    if (!result.success) {
      showError(result.error.errors[0].message)
      if (fileInputRef.current) fileInputRef.current.value = "" // Reset input
      return
    }

    // Create immediate preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    // Trigger upload
    uploadPicture(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const getInitials = () => {
    if (!user) return "?"
    // Try to get initials from profile first_name/last_name, otherwise username
    const profile = user.member_profile
    if (profile?.first_name && profile?.last_name) {
        return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    return user.username?.substring(0, 2).toUpperCase() ?? "U"
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-32 w-32 border-4 border-background shadow-xl cursor-pointer" onClick={triggerFileInput}>
          <AvatarImage src={preview || user?.profile_picture_url || "/images/default-avatar.png"} alt="Profile Picture" />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div 
            className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors"
            onClick={triggerFileInput}
        >
            <Camera className="w-5 h-5" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
            {isPending ? "Uploading..." : "Click to change profile picture"}
        </p>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/gif, image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
        disabled={isPending}
      />
    </div>
  )
}
