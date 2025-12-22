"use client"

import { useState } from "react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns"
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface EventCategory {
  id: string
  name: string
  color: string // Tailwind color class like 'bg-blue-500'
}

export interface CalendarEvent {
  id: string
  name: string
  categoryId: string
  date: Date
  // Optional fields for tooltip
  description?: string
  venue?: string
  time?: string
  isOnline?: boolean
}

export interface EventCalendarClassNames {
  container?: string
  navigation?: string
  navigationSelects?: string
  navigationButtons?: string
  calendar?: string
  weekHeader?: string
  weekDay?: string
  daysGrid?: string
  dayCell?: string
  dayCellOutsideMonth?: string
  dayNumber?: string
  dayNumberToday?: string
  dayNumberOutsideMonth?: string
  eventsContainer?: string
  eventButton?: string
}

export interface EventCalendarProps {
  events: CalendarEvent[]
  categories: EventCategory[]
  initialDate?: Date
  onEventClick?: (event: CalendarEvent) => void
  className?: string
  classNames?: EventCalendarClassNames
  showNavigation?: boolean
  cellHeight?: string // Tailwind height class like 'h-28', 'h-32', etc.
  eventTextColor?: string // Override default white text for events
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function EventCalendar({
  events,
  categories,
  initialDate,
  onEventClick,
  className,
  classNames = {},
  showNavigation = true,
  cellHeight = "min-h-28",
  eventTextColor = "text-white",
}: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date())

  // Generate calendar days (42 days to fill 6 weeks)
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  // Navigation handlers
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const handleMonthChange = (monthIndex: string) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), parseInt(monthIndex), 1)
    )
  }

  const handleYearChange = (year: string) => {
    setCurrentDate(new Date(parseInt(year), currentDate.getMonth(), 1))
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter((event) => isSameDay(event.date, date))
  }

  // Get category by id
  const getCategory = (categoryId: string): EventCategory | undefined => {
    return categories.find((c) => c.id === categoryId)
  }

  // Get category color
  const getCategoryColor = (categoryId: string): string => {
    return getCategory(categoryId)?.color || "bg-gray-500"
  }

  // Generate year range (10 years back and forward)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  return (
    <div className={cn("w-full max-w-7xl mx-auto", className, classNames.container)}>
      {/* Navigation Controls */}
      {showNavigation && (
        <div className={cn(
          "flex items-center justify-between mb-4 gap-4",
          classNames.navigation
        )}>
          <div className={cn("flex items-center gap-2", classNames.navigationSelects)}>
            <Select
              value={currentDate.getMonth().toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, index) => (
                  <SelectItem key={month} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentDate.getFullYear().toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={cn("flex items-center gap-2", classNames.navigationButtons)}>
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className={cn(
        "border rounded-lg overflow-hidden bg-background shadow-sm",
        classNames.calendar
      )}>
        {/* Week Header */}
        <div className={cn(
          "grid grid-cols-7 border-b bg-muted/50",
          classNames.weekHeader
        )}>
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className={cn(
                "text-center font-medium text-sm py-3 border-r last:border-r-0",
                classNames.weekDay
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className={cn("grid grid-cols-7", classNames.daysGrid)}>
          {calendarDays.map((day) => {
            const dayEvents = getEventsForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isCurrentDay = isToday(day)

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  cellHeight,
                  "border-r border-b last:border-r-0 p-2",
                  "flex flex-col",
                  !isCurrentMonth && "bg-muted/20",
                  classNames.dayCell,
                  !isCurrentMonth && classNames.dayCellOutsideMonth
                )}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-sm font-medium inline-flex items-center justify-center w-6 h-6 rounded-full",
                      classNames.dayNumber,
                      isCurrentDay && "bg-primary text-primary-foreground font-bold",
                      isCurrentDay && classNames.dayNumberToday,
                      !isCurrentMonth && !isCurrentDay && "text-muted-foreground",
                      !isCurrentMonth && !isCurrentDay && classNames.dayNumberOutsideMonth
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Events Container - Scrollable */}
                <div className={cn(
                  "flex-1 overflow-y-auto space-y-1",
                  classNames.eventsContainer
                )}>
                  {dayEvents.map((event) => {
                    const color = getCategoryColor(event.categoryId)
                    const category = getCategory(event.categoryId)
                    return (
                      <div key={event.id} className="relative group">
                        <button
                          onClick={() => onEventClick?.(event)}
                          className={cn(
                            "w-full text-left text-xs px-2 py-1 rounded truncate",
                            "transition-opacity hover:opacity-80",
                            "font-medium",
                            eventTextColor,
                            color,
                            classNames.eventButton
                          )}
                        >
                          {event.name}
                        </button>
                        
                        {/* Tooltip */}
                        <div className="absolute left-0 bottom-full mb-2 z-50 hidden group-hover:block w-64 pointer-events-none">
                          <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 text-sm">
                            <p className="font-semibold mb-1 line-clamp-2">{event.name}</p>
                            {category && (
                              <div className="flex items-center gap-2 mb-2">
                                <div className={cn("w-2 h-2 rounded-full", category.color)} />
                                <span className="text-xs text-muted-foreground">{category.name}</span>
                              </div>
                            )}
                            {event.time && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <Clock className="h-3 w-3" />
                                <span>{event.time}</span>
                              </div>
                            )}
                            {(event.venue || event.isOnline !== undefined) && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <MapPin className="h-3 w-3" />
                                <span>{event.isOnline ? "Online Event" : event.venue || "TBA"}</span>
                              </div>
                            )}
                            {event.description && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                            <p className="text-xs text-primary mt-2">Click to view details</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
