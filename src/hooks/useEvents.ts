import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { eventsApi } from "@/lib/api"
import { EventsArraySchema, EventSchema, Event, RsvpPayload } from "@/schemas/event"

export function useEvents(params?: { page?: number; search?: string }) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => eventsApi.list(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => eventsApi.get(id),
    enabled: !!id,
  })
}

export function useRsvp() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: RsvpPayload }) => {
      return eventsApi.rsvp(id, payload)
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
      queryClient.invalidateQueries({ queryKey: ["event", variables.id] })
    },
  })
}
