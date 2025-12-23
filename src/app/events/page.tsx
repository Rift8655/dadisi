"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { isSameDay, format } from "date-fns"
import { Search, Calendar, MapPin, Filter, Grid, List, Loader2 } from "lucide-react"
import { EventCalendar, type CalendarEvent, type EventCategory } from "@/components/EventCalendar"
import { EventCard } from "@/components/EventCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEvents, useEventCategories, useEventTags } from "@/hooks/useEvents"
import type { Event } from "@/schemas/event"
import type { EventCategory as EventCategoryType } from "@/types"

// Default category colors for calendar display
const CATEGORY_COLORS: Record<string, string> = {
  "biotech-health": "bg-sky-600",
  "community-science": "bg-indigo-600",
  "education-tutorials": "bg-emerald-600",
  "environmental-science": "bg-teal-600",
  "technology-coding": "bg-violet-600",
  "workshops-hands-on": "bg-amber-600",
  "default": "bg-primary",
}

function getCategoryColor(categorySlug?: string): string {
  if (!categorySlug) return CATEGORY_COLORS.default
  return CATEGORY_COLORS[categorySlug.toLowerCase()] || CATEGORY_COLORS.default
}

export default function EventsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedCounty, setSelectedCounty] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [eventType, setEventType] = useState<"all" | "upcoming" | "past">("upcoming")
  const [isOnline, setIsOnline] = useState<boolean | undefined>(undefined)

  const params = useMemo(() => {
    const p: Record<string, string | number | boolean | undefined> = { type: eventType }
    if (selectedCategory !== "all") p.category_id = parseInt(selectedCategory)
    if (searchQuery) p.search = searchQuery
    if (isOnline !== undefined) p.is_online = isOnline
    if (selectedCounty !== "all") p.county_id = parseInt(selectedCounty)
    return p
  }, [eventType, selectedCategory, searchQuery, isOnline, selectedCounty])

  const { data: eventsResponse, isLoading: eventsLoading, error: eventsError } = useEvents(params)
  const { data: categories = [], isLoading: categoriesLoading } = useEventCategories()
  const { data: tags = [], isLoading: tagsLoading } = useEventTags()

  const events = eventsResponse?.data || []
  const isLoading = eventsLoading || categoriesLoading || tagsLoading
  const error = eventsError ? (eventsError as Error).message : null


  // Transform events for calendar
  const calendarCategories: EventCategory[] = useMemo(() => {
    return categories.map(cat => ({
      id: cat.id.toString(),
      name: cat.name,
      color: getCategoryColor(cat.slug),
    }))
  }, [categories])

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map((event: Event) => ({
      id: event.id.toString(),
      name: event.title,
      categoryId: event.category?.id?.toString() || "default",
      date: new Date(event.starts_at),
      description: event.description,
      venue: event.venue || event.county?.name,
      time: format(new Date(event.starts_at), "h:mm a"),
      isOnline: event.is_online,
    }))
  }, [events])

  // Handle calendar event click
  const handleCalendarEventClick = (calendarEvent: CalendarEvent) => {
    const event = events.find((e: Event) => e.id.toString() === calendarEvent.id)
    if (event) {
      router.push(`/events/${event.slug}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="container mx-auto max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Discover Events
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our community events, workshops, and meetups. Connect with like-minded individuals and grow together.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Event Calendar */}
        <section className="mb-8">
          <EventCalendar
            events={calendarEvents}
            categories={calendarCategories}
            onEventClick={handleCalendarEventClick}
            cellHeight="min-h-24"
            className="shadow-lg px-4"
            classNames={{
              calendar: "border-2 rounded-xl",
              weekHeader: "bg-primary/10 dark:bg-primary/20",
              weekDay: "py-3 font-semibold",
              dayCell: "hover:bg-accent/30 transition-colors",
              dayNumberToday: "bg-primary text-primary-foreground ring-2 ring-primary/30",
              eventButton: "shadow-sm hover:shadow-md transition-shadow",
              navigation: "bg-card p-3 rounded-lg shadow-sm border",
            }}
          />
        </section>

        {/* Category Legend */}
        {categories.length > 0 && (
          <div className="p-4 bg-card rounded-lg border mb-8">
            <h3 className="text-sm font-semibold mb-3">Categories</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${getCategoryColor(category.slug)}`} />
                  <span className="text-sm text-muted-foreground">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events by name, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-11 rounded-lg border-2 focus:border-primary"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Event Type Toggle */}
          <div className="flex rounded-lg border overflow-hidden">
            {(["upcoming", "all", "past"] as const).map((type) => (
              <Button
                key={type}
                variant={eventType === type ? "default" : "ghost"}
                size="sm"
                onClick={() => setEventType(type)}
                className="rounded-none capitalize"
              >
                {type}
              </Button>
            ))}
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Online/In-person Filter */}
          <div className="flex rounded-lg border overflow-hidden">
            <Button
              variant={isOnline === undefined ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsOnline(undefined)}
              className="rounded-none"
            >
              All
            </Button>
            <Button
              variant={isOnline === false ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsOnline(false)}
              className="rounded-none"
            >
              <MapPin className="h-4 w-4 mr-1" />
              In-Person
            </Button>
            <Button
              variant={isOnline === true ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsOnline(true)}
              className="rounded-none"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Online
            </Button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="rounded-none"
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Events Grid/List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {eventType === "upcoming" ? "Upcoming Events" : eventType === "past" ? "Past Events" : "All Events"}
            </h2>
            <Badge variant="secondary">{events.length} events</Badge>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-destructive">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-lg">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No events found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search or filters" : "Check back later for upcoming events!"}
              </p>
            </div>
          ) : (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }>
              {events.map((event) => (
                <EventCard key={event.id} event={event as any} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
