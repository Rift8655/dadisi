"use client"

import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { Calendar, MapPin, Users, Globe, Clock } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Event } from "@/types"

interface EventCardProps {
  event: Event
  className?: string
}

export function EventCard({ event, className }: EventCardProps) {
  const isLocal = process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("localhost") || 
                  process.env.NEXT_PUBLIC_BACKEND_APP_URL?.includes("127.0.0.1")
  const eventDate = new Date(event.starts_at)
  const isFreeEvent = !event.price || event.price === 0
  const isPastEvent = eventDate < new Date()

  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      isPastEvent && "opacity-75",
      className
    )}>
      {/* Image Section */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            unoptimized={isLocal}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
            <Calendar className="h-12 w-12 text-primary/60" />
          </div>
        )}
        
        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {event.featured && (
            <Badge className="bg-yellow-500 text-yellow-950">Featured</Badge>
          )}
          {isPastEvent && (
            <Badge variant="secondary">Past</Badge>
          )}
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-2 right-2">
          <Badge variant={isFreeEvent ? "default" : "secondary"} className={cn(
            isFreeEvent && "bg-green-500 text-white"
          )}>
            {isFreeEvent ? "Free" : `${event.currency} ${event.price.toLocaleString()}`}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        {/* Category */}
        {event.category && (
          <Badge variant="outline" className="w-fit text-xs mb-1">
            {event.category.name}
          </Badge>
        )}
        
        {/* Title */}
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
      </CardHeader>

      <CardContent className="pb-3 space-y-2 text-sm text-muted-foreground">
        {/* Date & Time */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>{format(eventDate, "EEE, MMM d, yyyy • h:mm a")}</span>
        </div>

        {/* Location / Online */}
        <div className="flex items-center gap-2">
          {event.is_online ? (
            <>
              <Globe className="h-4 w-4 flex-shrink-0 text-blue-500" />
              <span className="text-blue-600 dark:text-blue-400">Online Event</span>
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{event.venue || event.county?.name || "TBA"}</span>
            </>
          )}
        </div>

        {/* Capacity */}
        {event.capacity && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>{event.capacity} spots</span>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <p className="line-clamp-2 pt-1">{event.description}</p>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild className="w-full" variant={isPastEvent ? "secondary" : "default"}>
          <Link href={`/events/${event.slug}`}>
            {isPastEvent ? "View Details" : "Register Now"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
