"use client"

import { useEffect } from "react"
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { useNotifications } from "@/store/notifications"
import { useAuth } from "@/store/auth"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export function NotificationDropdown() {
  const { isAuthenticated } = useAuth()
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  // Fetch notifications on mount and periodically
  useEffect(() => {
    if (!isAuthenticated) return

    // Initial fetch
    fetchNotifications()

    // Poll for unread count every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount])

  if (!isAuthenticated) return null

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read_at) {
      markAsRead(notification.id)
    }
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
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
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
              onClick={markAllAsRead}
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
                <div className="flex-1 min-w-0">
                  {notification.data.link ? (
                    <Link
                      href={notification.data.link}
                      onClick={() => handleNotificationClick(notification)}
                      className="block"
                    >
                      <p className="text-sm font-medium line-clamp-1">
                        {notification.data.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.data.message}
                      </p>
                    </Link>
                  ) : (
                    <div onClick={() => handleNotificationClick(notification)}>
                      <p className="text-sm font-medium line-clamp-1">
                        {notification.data.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
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
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.read_at && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {!notification.read_at && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l" />
                )}
              </div>
            ))}
          </ScrollArea>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/notifications"
            className="w-full justify-center text-center text-sm"
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
