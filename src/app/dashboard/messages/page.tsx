"use client"

import { useState, useEffect } from "react"
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
import { useAuth } from "@/store/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import Swal from "sweetalert2"

export default function MessagesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

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

  // Real-time updates via WebSockets
  useRealtimeChat({
    onMessage: (payload) => {
      // Show notification for new messages
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


  // Fetch conversations
  const { data: conversations, isLoading: loadingConversations } = useConversations(hasKeys)

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: loadingMessages } = useConversationMessages(selectedPartner, hasKeys)

  // Get recipient's public key for sending
  const { data: recipientKeyData } = useRecipientPublicKey(selectedPartner, hasKeys)

  // Mutations
  const sendMutation = useSendMessageMutation()
  const storeKeysMutation = useStoreMessageKeysMutation()

  // Handle message sending
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner) return

    try {
      // 1. Get recipient public key
      if (!recipientKeyData?.public_key) {
        throw new Error("Recipient public key not found. They might not have encryption enabled.")
      }

      // 2. Encrypt message locally
      const { encryptedData, encryptedKeyPackage, nonce } = await encryptMessage(
        newMessage,
        recipientKeyData.public_key
      )

      // 3. Upload to R2 (via server-signed URL or direct if configured)
      // For now, our backend handles R2 upload via messageApi.send which might take a blob
      // BUT according to the useSendMessageMutation, it expects metadata.
      // Usually, there's a step to upload the blob first.
      
      const uploadData = await messageApi.getUploadUrl()
      await fetch(uploadData.upload_url, {
        method: "PUT",
        body: encryptedData,
        headers: { "Content-Type": "application/octet-stream" },
      })

      // 4. Store metadata and notification
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

  // Set up encryption keys
  const handleSetupKeys = async () => {
    setIsSettingUp(true)
    try {
      const { publicKeyJwk, privateKeyJwk } = await generateKeyPair()
      
      // Store on server
      await storeKeysMutation.mutateAsync(publicKeyJwk)
      
      // Store locally
      saveKeysToStorage(publicKeyJwk, privateKeyJwk)
      
      setHasKeys(true)
      Swal.fire({
        icon: "success",
        title: "Encryption enabled!",
        text: "Your messages are now end-to-end encrypted.",
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error: any) {
      Swal.fire("Error", error.message || "Failed to set up encryption", "error")
    } finally {
      setIsSettingUp(false)
    }
  }

  // Decrypt a single message
  const handleDecrypt = async (message: PrivateMessage) => {
    if (decryptedMessages.has(message.id) || decryptingIds.has(message.id)) return

    setDecryptingIds((prev: Set<string>) => new Set(prev).add(message.id))

    try {
      // Get the encrypted blob from R2
      const vaultData = await messageApi.getVaultUrl(message.id)
      const response = await fetch(vaultData.download_url)
      const encryptedBlob = await response.arrayBuffer()

      // Decrypt
      const plaintext = await decryptMessage(
        encryptedBlob,
        vaultData.encrypted_key_package,
        vaultData.nonce
      )

      setDecryptedMessages((prev: Map<string, string>) => new Map(prev).set(message.id, plaintext))
    } catch (error) {
      console.error("Decryption failed:", error)
      setDecryptedMessages((prev: Map<string, string>) => new Map(prev).set(message.id, "[Decryption failed]"))
    } finally {
      setDecryptingIds((prev: Set<string>) => {
        const next = new Set(prev)
        next.delete(message.id)
        return next
      })
    }
  }

  // Key setup dialog
  if (!hasKeys) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Key className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Enable Secure Messaging</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Set up end-to-end encryption to send private messages. Your messages will be
              encrypted on your device before being sent, ensuring only the recipient can read them.
            </p>

            <div className="flex items-center justify-center gap-4 py-4">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span>End-to-end encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Key className="h-4 w-4 text-blue-500" />
                <span>Keys stored locally</span>
              </div>
            </div>

            <Button onClick={handleSetupKeys} disabled={isSettingUp} size="lg">
              {isSettingUp ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Enable Encryption
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              Your private key will only be stored in this browser. If you clear your browser
              data, you will lose access to old messages.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedConversation = conversations?.find(
    (c) => c.partner.id === selectedPartner
  )

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="md:col-span-1">
          <Card className="h-[calc(100vh-200px)]">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Conversations</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  <ShieldCheck className="h-3 w-3 mr-1" /> E2E Encrypted
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-auto">
              {loadingConversations ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : conversations?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {conversations?.map((conv) => (
                    <button
                      key={conv.partner.id}
                      onClick={() => setSelectedPartner(conv.partner.id)}
                      className={`w-full p-4 text-left hover:bg-accent/50 transition-colors ${
                        selectedPartner === conv.partner.id ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conv.partner.profile_picture_path ?? undefined} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">
                              {conv.partner.username}
                            </span>
                            {conv.unread_count > 0 && (
                              <Badge variant="default" className="text-xs">
                                {conv.unread_count}
                              </Badge>
                            )}
                          </div>
                          {conv.last_message_at && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(conv.last_message_at), "MMM d, HH:mm")}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-200px)] flex flex-col">
            {!selectedPartner ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <CardHeader className="py-3 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedConversation?.partner.profile_picture_path ?? undefined} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {selectedConversation?.partner.username}
                    </span>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-lg" />
                      ))}
                    </div>
                  ) : messagesData?.data.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messagesData?.data.map((msg) => {
                      const isMine = msg.sender_id === user?.id
                      const isDecrypted = decryptedMessages.has(msg.id)
                      const isDecrypting = decryptingIds.has(msg.id)

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isMine
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {isDecrypted ? (
                              <p className="whitespace-pre-wrap">
                                {decryptedMessages.get(msg.id)}
                              </p>
                            ) : (
                              <Button
                                variant={isMine ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => handleDecrypt(msg)}
                                disabled={isDecrypting}
                              >
                                {isDecrypting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Key className="h-4 w-4 mr-2" />
                                    Decrypt
                                  </>
                                )}
                              </Button>
                            )}
                            <span className="block text-xs mt-1 opacity-70">
                              {format(new Date(msg.created_at), "HH:mm")}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={1}
                      className="min-h-[44px] max-h-32"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          if (newMessage.trim()) {
                            handleSendMessage()
                          }
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendMutation.isPending || !newMessage.trim()}
                    >
                      {sendMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
