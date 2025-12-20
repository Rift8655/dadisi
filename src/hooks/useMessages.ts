import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { messageApi } from "@/lib/api"
import type { Conversation, PrivateMessage } from "@/lib/api"

export function useConversations(enabled: boolean = true) {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => messageApi.conversations(),
    enabled,
  })
}

export function useConversationMessages(partnerId: number | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["messages", partnerId],
    queryFn: () => messageApi.getConversation(partnerId!),
    enabled: enabled && !!partnerId,
  })
}

export function useRecipientPublicKey(partnerId: number | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["public-key", partnerId],
    queryFn: () => messageApi.keys.get(partnerId!),
    enabled: enabled && !!partnerId,
  })
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      recipient_id: number
      r2_object_key: string
      encrypted_key_package: string
      nonce: string
    }) => messageApi.send(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.recipient_id] })
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })
}

export function useStoreMessageKeysMutation() {
  return useMutation({
    mutationFn: (publicKeyJwk: string) => messageApi.keys.store(publicKeyJwk),
  })
}
