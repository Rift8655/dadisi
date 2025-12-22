import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { eventsApi } from "@/lib/api"
import { EventsListSchema, EventSchema, Event, RsvpPayload, EventCategory, EventTagSchema } from "@/schemas/event"

export function useEvents(params?: any) {
  return useQuery<z.infer<typeof EventsListSchema>>({
    queryKey: ["events", params],
    queryFn: () => eventsApi.list(params),
    staleTime: 1000 * 60 * 5,
  })
}



export function useEvent(id: number | string) {
  return useQuery<Event>({
    queryKey: ["event", id],
    queryFn: () => eventsApi.get(id),
    enabled: !!id,
  })
}


export type RSVPDetails = { name: string; email: string; guests: number; note?: string }

export type RsvpInput =
  | { eventId: number; ticketId: number }
  | { id: number; payload: any }
 
export function useRsvp() {
  const queryClient = useQueryClient()
  return useMutation<any, any, RsvpInput>({
    mutationFn: (data: RsvpInput) => {
      if ("eventId" in data) {
        return eventsApi.register(data.eventId, { ticket_id: data.ticketId })
      } else {
        return eventsApi.rsvp(data.id, data.payload)
      }
    },
    onSuccess: (_, data) => {
      const id = "eventId" in data ? data.eventId : data.id
      queryClient.invalidateQueries({ queryKey: ["event", id] })
      queryClient.invalidateQueries({ queryKey: ["events"] })
      queryClient.invalidateQueries({ queryKey: ["user-events"] })
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] })
    },
  })
}

export function useValidatePromo() {
  return useMutation({
    mutationFn: ({ eventId, code, ticketId }: { eventId: number; code: string; ticketId: number }) =>
      eventsApi.validatePromo(eventId, { code, ticket_id: ticketId }),
  })
}


export function useEventCategories() {
  return useQuery<Pick<EventCategory, "id" | "name" | "slug">[]>({
    queryKey: ["eventCategories"],
    queryFn: () => eventsApi.getCategories(),
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}


export function useEventTags() {
  return useQuery<z.infer<typeof EventTagSchema>[]>({
    queryKey: ["eventTags"],
    queryFn: () => eventsApi.getTags(),
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}


