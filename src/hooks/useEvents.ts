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


export function useRsvp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventId, ticketId }: { eventId: number; ticketId: number }) =>
      eventsApi.register(eventId, { ticket_id: ticketId }),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] })
      queryClient.invalidateQueries({ queryKey: ["events"] })
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


