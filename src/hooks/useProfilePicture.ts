import { useMutation, useQueryClient } from "@tanstack/react-query"
import { memberProfileApi } from "@/lib/api"
import { useAuth } from "@/store/auth"
import { showSuccess, showError } from "@/lib/sweetalert"

export function useUploadProfilePicture() {
  const { updateUser, user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("profile_picture", file)
      const res = await memberProfileApi.uploadProfilePicture(formData)
      return res.data
    },
    onSuccess: (data) => {
      showSuccess("Profile picture updated successfully")
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["member-profile", "me"] })
      
      if (user) {
        // Merge the new profile picture URL into the existing user object
        updateUser({
          profile_picture_url: data.profile_picture_url,
        })
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      showError(message || "Failed to upload profile picture")
    },
  })
}
