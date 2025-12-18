"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { useAuth } from "@/store/auth"

interface ChatUser {
  id: number
  username: string
  avatar?: string
  isOnline: boolean
  lastSeen?: string
}

interface ChatMessage {
  id: number
  senderId: number
  receiverId: number
  content: string
  createdAt: string
  isRead: boolean
}

// Mock data - replace with actual API calls
const mockUsers: ChatUser[] = [
  { id: 1, username: "Alice", isOnline: true },
  { id: 2, username: "Bob", isOnline: false, lastSeen: "2 hours ago" },
  { id: 3, username: "Charlie", isOnline: true },
]

const mockMessages: ChatMessage[] = [
  { id: 1, senderId: 1, receiverId: 0, content: "Hey! How are you?", createdAt: "2024-01-15T10:00:00Z", isRead: true },
  { id: 2, senderId: 0, receiverId: 1, content: "I'm doing great, thanks!", createdAt: "2024-01-15T10:01:00Z", isRead: true },
  { id: 3, senderId: 1, receiverId: 0, content: "Are you coming to the event tomorrow?", createdAt: "2024-01-15T10:02:00Z", isRead: true },
]

function UserAvatar({ username, isOnline }: { username: string; isOnline: boolean }) {
  return (
    <div className="relative">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
        {username.charAt(0).toUpperCase()}
      </div>
      <span
        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
          isOnline ? "bg-green-500" : "bg-gray-400"
        }`}
      />
    </div>
  )
}

export default function ChatPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<ChatUser[]>(mockUsers)
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load messages when user is selected
  useEffect(() => {
    if (selectedUser) {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        setMessages(mockMessages)
        setLoading(false)
      }, 500)
    }
  }, [selectedUser])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return

    const message: ChatMessage = {
      id: Date.now(),
      senderId: 0, // Current user
      receiverId: selectedUser.id,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // TODO: Send message via API
    // await chatApi.sendMessage(selectedUser.id, newMessage)
  }

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    } catch {
      return ""
    }
  }

  return (
    <UserDashboardShell title="Chat">
      <div className="flex h-[calc(100vh-16rem)] gap-4">
        {/* Users List */}
        <Card className="w-80 flex-shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conversations</CardTitle>
            <CardDescription>Chat with other community members</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {users.map((chatUser) => (
                <button
                  key={chatUser.id}
                  onClick={() => setSelectedUser(chatUser)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                    selectedUser?.id === chatUser.id ? "bg-muted" : ""
                  }`}
                >
                  <UserAvatar username={chatUser.username} isOnline={chatUser.isOnline} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{chatUser.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {chatUser.isOnline ? "Online" : chatUser.lastSeen || "Offline"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {users.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No conversations yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b pb-3">
                <div className="flex items-center gap-3">
                  <UserAvatar username={selectedUser.username} isOnline={selectedUser.isOnline} />
                  <div>
                    <CardTitle className="text-lg">{selectedUser.username}</CardTitle>
                    <CardDescription>
                      {selectedUser.isOnline ? "Online" : selectedUser.lastSeen || "Offline"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.senderId === 0
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isOwn
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`mt-1 text-xs ${
                                isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    Send
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a user from the list to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </UserDashboardShell>
  )
}
