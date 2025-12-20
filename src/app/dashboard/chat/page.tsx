"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { useAuth } from "@/store/auth"
import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  MessageSquare,
  Send,
  User,
  Search,
  Key,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { messageApi, type Conversation, type PrivateMessage } from "@/lib/api"
import {
  generateKeyPair,
  saveKeysToStorage,
  hasMessagingKeys,
  getStoredPublicKey,
  encryptMessage,
  decryptMessage,
} from "@/lib/messaging-crypto"
import {
  useConversations,
  useConversationMessages,
  useRecipientPublicKey,
  useSendMessageMutation,
  useStoreMessageKeysMutation,
} from "@/hooks/useMessages"
import { useRealtimeChat } from "@/hooks/useRealtimeChat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Swal from "sweetalert2"

function UserAvatar({ username, isOnline, src }: { username: string; isOnline?: boolean; src?: string | null }) {
  return (
    <div className="relative">
      <Avatar className="h-10 w-10">
        <AvatarImage src={src ?? undefined} />
        <AvatarFallback>
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
        />
      )}
    </div>
  )
}

export default function ChatPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [hasKeys, setHasKeys] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [decryptedMessages, setDecryptedMessages] = useState<Map<string, string>>(new Map())
  const [decryptingIds, setDecryptingIds] = useState<Set<string>>(new Set())

  // Check for existing keys on mount
  useEffect(() => {
    setHasKeys(hasMessagingKeys())
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [decryptedMessages])

  // Real-time updates via WebSockets
  useRealtimeChat({
    onMessage: (payload) => {
      if (payload.sender_id !== selectedPartner) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: `New message from ${payload.sender_username}`,
          showConfirmButton: false,
          timer: 3000,
        })
      }
    },
  })

  // Fetch data
  const { data: conversations, isLoading: loadingConversations } = useConversations(hasKeys)
  const { data: messagesData, isLoading: loadingMessages } = useConversationMessages(selectedPartner, hasKeys)
  const { data: recipientKeyData } = useRecipientPublicKey(selectedPartner, hasKeys)

  // Mutations
  const sendMutation = useSendMessageMutation()
  const storeKeysMutation = useStoreMessageKeysMutation()

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner) return

    try {
      if (!recipientKeyData?.public_key) {
        throw new Error("Recipient public key not found. They might not have encryption enabled.")
      }

      const { encryptedData, encryptedKeyPackage, nonce } = await encryptMessage(
        newMessage,
        recipientKeyData.public_key
      )

      const uploadData = await messageApi.getUploadUrl()
      await fetch(uploadData.upload_url, {
        method: "PUT",
        body: encryptedData,
        headers: { "Content-Type": "application/octet-stream" },
      })

      await sendMutation.mutateAsync({
        recipient_id: selectedPartner,
        r2_object_key: uploadData.object_key,
        encrypted_key_package: encryptedKeyPackage,
        nonce,
      })

      setNewMessage("")
    } catch (error: any) {
      Swal.fire("Error", error.message || "Failed to send message", "error")
    }
  }

  const handleSetupKeys = async () => {
    setIsSettingUp(true)
    try {
      const { publicKeyJwk, privateKeyJwk } = await generateKeyPair()
      await storeKeysMutation.mutateAsync(publicKeyJwk)
      saveKeysToStorage(publicKeyJwk, privateKeyJwk)
      setHasKeys(true)
      Swal.fire({ icon: "success", title: "Encryption enabled!", timer: 2000, showConfirmButton: false })
    } catch (error: any) {
      Swal.fire("Error", error.message || "Failed to set up encryption", "error")
    } finally {
      setIsSettingUp(false)
    }
  }

  const handleDecrypt = async (message: PrivateMessage) => {
    if (decryptedMessages.has(message.id) || decryptingIds.has(message.id)) return
    setDecryptingIds(prev => new Set(prev).add(message.id))

    try {
      const vaultData = await messageApi.getVaultUrl(message.id)
      const response = await fetch(vaultData.download_url)
      const encryptedBlob = await response.arrayBuffer()
      const plaintext = await decryptMessage(encryptedBlob, vaultData.encrypted_key_package, vaultData.nonce)
      setDecryptedMessages(prev => new Map(prev).set(message.id, plaintext))
    } catch (error) {
      setDecryptedMessages(prev => new Map(prev).set(message.id, "[Decryption failed]"))
    } finally {
      setDecryptingIds(prev => {
        const next = new Set(prev)
        next.delete(message.id)
        return next
      })
    }
  }

  if (!hasKeys) {
    return (
      <UserDashboardShell title="Chat">
        <div className="max-w-2xl mx-auto py-8">
          <Card className="text-center p-8">
            <Key className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle className="text-2xl mb-2">Enable Secure Chat</CardTitle>
            <CardDescription className="mb-6">
              Set up end-to-end encryption to chat with community members securely.
            </CardDescription>
            <Button onClick={handleSetupKeys} disabled={isSettingUp} size="lg">
              {isSettingUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
              Enable Encryption
            </Button>
          </Card>
        </div>
      </UserDashboardShell>
    )
  }

  const selectedConversation = conversations?.find(c => c.partner.id === selectedPartner)

  return (
    <UserDashboardShell title="Chat">
      <div className="flex h-[calc(100vh-16rem)] gap-4">
        {/* Conversations List */}
        <Card className="w-80 flex-shrink-0 flex flex-col">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {loadingConversations ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : conversations?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No chats yet</div>
            ) : (
              <div className="divide-y">
                {conversations?.map((conv) => (
                  <button
                    key={conv.partner.id}
                    onClick={() => setSelectedPartner(conv.partner.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                      selectedPartner === conv.partner.id ? "bg-muted" : ""
                    }`}
                  >
                    <UserAvatar 
                      username={conv.partner.username} 
                      src={conv.partner.profile_picture_path} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate text-sm">{conv.partner.username}</p>
                        {conv.unread_count > 0 && (
                          <Badge className="h-5 min-w-5 px-1">{conv.unread_count}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.last_message_at ? format(new Date(conv.last_message_at), "HH:mm") : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Area */}
        <Card className="flex-1 flex flex-col">
          {selectedPartner ? (
            <>
              <CardHeader className="py-3 border-b flex flex-row items-center gap-3 space-y-0">
                <UserAvatar 
                  username={selectedConversation?.partner.username || "User"} 
                  src={selectedConversation?.partner.profile_picture_path} 
                />
                <CardTitle className="text-base">{selectedConversation?.partner.username}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : messagesData?.data.map((msg) => {
                  const isMine = msg.sender_id === user?.id
                  const isDecrypted = decryptedMessages.has(msg.id)
                  const isDecrypting = decryptingIds.has(msg.id)
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {isDecrypted ? (
                          <p className="text-sm pb-1">{decryptedMessages.get(msg.id)}</p>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleDecrypt(msg)} disabled={isDecrypting}>
                            {isDecrypting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Key className="h-3 w-3 mr-1" />}
                            Decrypt
                          </Button>
                        )}
                        <span className="text-[10px] opacity-70 block text-right">
                          {format(new Date(msg.created_at), "HH:mm")}
                        </span>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage() }}
                  className="flex gap-2"
                >
                  <Input 
                    placeholder="Type a message..." 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    disabled={sendMutation.isPending}
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim() || sendMutation.isPending}>
                    {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          )}
        </Card>
      </div>
    </UserDashboardShell>
  )
}
