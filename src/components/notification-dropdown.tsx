"use client"

import Link from "next/link"
import { useAuth } from "@/store/auth"
import { formatDistanceToNow } from "date-fns"
import { Bell, Check, CheckCheck, X } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  useDeleteNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotificationsList,
  useUnreadCount,
} from "@/hooks/useNotifications"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

export function NotificationDropdown() {
  const { isAuthenticated } = useAuth()

  // TanStack Query hooks - automatic deduplication and visibility-aware polling
  const { data: unreadCount = 0 } = useUnreadCount()
  const { data: notificationsData, isLoading } = useNotificationsList({
    per_page: 10,
  })
  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()
  const deleteNotificationMutation = useDeleteNotification()

  const notifications = notificationsData?.data?.data ?? []

  if (!isAuthenticated) return null

  const handleNotificationClick = (notification: (typeof notifications)[0]) => {
    if (!notification.read_at) {
      markAsReadMutation.mutate(notification.id)
    }
  }

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id)
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const handleDelete = (id: string) => {
    deleteNotificationMutation.mutate(id)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "TicketPurchaseConfirmation":
        return "🎫"
      case "DonationReceived":
        return "❤️"
      case "RefundProcessed":
        return "💰"
      case "EventReminder":
        return "⏰"
      case "SubscriptionActivated":
        return "⭐"
      default:
        return "📬"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading && notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <ScrollArea className="h-80">
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "group relative flex items-start gap-3 border-b p-3 transition-colors hover:bg-muted/50",
                  !notification.read_at && "bg-primary/5"
                )}
              >
                <span className="text-lg">
                  {getNotificationIcon(notification.type)}
                </span>
                <div className="min-w-0 flex-1">
                  {notification.data.link ? (
                    <Link
                      href={notification.data.link}
                      onClick={() => handleNotificationClick(notification)}
                      className="block"
                    >
                      <p className="line-clamp-1 text-sm font-medium">
                        {notification.data.title}
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {notification.data.message}
                      </p>
                    </Link>
                  ) : (
                    <div onClick={() => handleNotificationClick(notification)}>
                      <p className="line-clamp-1 text-sm font-medium">
                        {notification.data.title}
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {notification.data.message}
                      </p>
                    </div>
                  )}
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {!notification.read_at && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(notification.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {!notification.read_at && (
                  <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l bg-primary" />
                )}
              </div>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
