import { useQuery, useMutation } from "@tanstack/react-query"
import { retentionApi } from "@/lib/api-admin"
import { RetentionSettingsArraySchema, RetentionSettingSchema } from "@/schemas/retention"

export function useRetentionSettings(params?: { data_type?: string }) {
  return useQuery({
    queryKey: ["retention-settings", params || {}],
    queryFn: async () => {
      const res = await retentionApi.list(params as any)
      const raw = res as unknown
      const payload = (raw as { data?: unknown }).data ?? raw
      return RetentionSettingsArraySchema.parse(payload)
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useRetentionSetting(id?: number) {
  return useQuery({
    queryKey: ["retention-setting", id],
    queryFn: async () => {
      if (!id) throw new Error("Missing id")
      const res = await retentionApi.getOne(id)
      const payload = (res as any).data ?? res
      return RetentionSettingSchema.parse(payload)
    },
    enabled: !!id,
  })
}

export function useUpdateRetention() {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: unknown }) => {
      const res = await retentionApi.update(id, payload as any)
      const raw = res as unknown
      const data = (raw as { data?: unknown }).data ?? raw
      return RetentionSettingSchema.parse(data)
    },
  })
}
