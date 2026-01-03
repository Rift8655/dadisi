"use client"

import { useState } from "react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
    setCurrentDate(new Date(currentDate.getFullYear(), parseInt(monthIndex), 1))
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

  // Check if color is a hex color (for inline styling) or Tailwind class
  const isHexColor = (color: string): boolean => {
    return color.startsWith("#")
  }

  // Get category color - returns hex or tailwind class
  const getCategoryColor = (categoryId: string): string => {
    return getCategory(categoryId)?.color || "#6B7280" // gray-500 fallback as hex
  }

  // Generate year range (10 years back and forward)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl",
        className,
        classNames.container
      )}
    >
      {/* Navigation Controls */}
      {showNavigation && (
        <div
          className={cn(
            "mb-4 flex items-center justify-between gap-4",
            classNames.navigation
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2",
              classNames.navigationSelects
            )}
          >
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

          <div
            className={cn(
              "flex items-center gap-2",
              classNames.navigationButtons
            )}
          >
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
      <div
        className={cn(
          "rounded-lg border bg-background shadow-sm",
          classNames.calendar
        )}
      >
        {/* Week Header */}
        <div
          className={cn(
            "grid grid-cols-7 border-b bg-muted/50",
            classNames.weekHeader
          )}
        >
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className={cn(
                "border-r py-3 text-center text-sm font-medium last:border-r-0",
                classNames.weekDay
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className={cn("grid grid-cols-7", classNames.daysGrid)}>
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isCurrentDay = isToday(day)
            const isRightColumn = index % 7 >= 4 // Thursday, Friday, Saturday
            const isTopRow = index < 7

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  cellHeight,
                  "border-b border-r p-2 last:border-r-0",
                  "relative flex flex-col overflow-visible",
                  "hover:z-30", // Raise z-index below navbar (z-40)
                  !isCurrentMonth && "bg-muted/20",
                  classNames.dayCell,
                  !isCurrentMonth && classNames.dayCellOutsideMonth
                )}
              >
                {/* Date Number */}
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium",
                      classNames.dayNumber,
                      isCurrentDay &&
                        "bg-primary font-bold text-primary-foreground",
                      isCurrentDay && classNames.dayNumberToday,
                      !isCurrentMonth &&
                        !isCurrentDay &&
                        "text-muted-foreground",
                      !isCurrentMonth &&
                        !isCurrentDay &&
                        classNames.dayNumberOutsideMonth
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                <div
                  className={cn(
                    "flex-1 space-y-1 overflow-y-auto has-[.group:hover]:overflow-visible",
                    classNames.eventsContainer
                  )}
                >
                  {dayEvents.map((event) => {
                    const color = getCategoryColor(event.categoryId)
                    const category = getCategory(event.categoryId)
                    const useInlineStyle = isHexColor(color)
                    return (
                      <div key={event.id} className="group relative">
                        <button
                          onClick={() => onEventClick?.(event)}
                          className={cn(
                            "w-full truncate rounded px-2 py-1 text-left text-xs",
                            "transition-opacity hover:opacity-80",
                            "font-medium text-white",
                            eventTextColor,
                            !useInlineStyle && color,
                            classNames.eventButton
                          )}
                          style={
                            useInlineStyle
                              ? { backgroundColor: color }
                              : undefined
                          }
                        >
                          {event.name}
                        </button>

                        {/* Tooltip */}
                        <div
                          className={cn(
                            "pointer-events-none absolute z-30 hidden w-64 group-hover:block",
                            isRightColumn ? "left-auto right-0" : "left-0",
                            isTopRow ? "top-full mt-2" : "bottom-full mb-2"
                          )}
                        >
                          <div className="rounded-lg border bg-popover p-3 text-sm text-popover-foreground shadow-lg">
                            <p className="mb-1 line-clamp-2 font-semibold">
                              {event.name}
                            </p>
                            {category && (
                              <div className="mb-2 flex items-center gap-2">
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={
                                    isHexColor(category.color)
                                      ? { backgroundColor: category.color }
                                      : undefined
                                  }
                                />
                                <span className="text-xs text-muted-foreground">
                                  {category.name}
                                </span>
                              </div>
                            )}
                            {event.time && (
                              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{event.time}</span>
                              </div>
                            )}
                            {(event.venue || event.isOnline !== undefined) && (
                              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>
                                  {event.isOnline
                                    ? "Online Event"
                                    : event.venue || "TBA"}
                                </span>
                              </div>
                            )}
                            {event.description && (
                              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                                {event.description}
                              </p>
                            )}
                            <p className="mt-2 text-xs text-primary">
                              Click to view details
                            </p>
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
