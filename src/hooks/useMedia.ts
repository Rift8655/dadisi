import { useQuery, useMutation } from "@tanstack/react-query"
import { mediaApi } from "@/lib/api"
import { queryClient } from "@/lib/queryClient"
import { MediaListSchema } from "@/schemas/common"

export function useMedia(params?: { page?: number; type?: string }) {
  return useQuery({
    queryKey: ["media", params],
    queryFn: async () => {
      const res = await mediaApi.list(params as any)
      const raw = res as unknown
      const data = (raw as { data?: unknown }).data ?? raw
      return MediaListSchema.parse({ data })
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  })
}

export function useUploadMedia() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      const res = await mediaApi.upload(formData)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] })
    },
  })
}

export function useDeleteMedia() {
  return useMutation({
    mutationFn: async (id: number) => {
      await mediaApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] })
    },
  })
}
