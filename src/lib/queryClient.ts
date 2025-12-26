"use client"

import { QueryClient } from "@tanstack/react-query"

/**
 * Shared QueryClient instance for React Query.
 * 
 * CACHING STRATEGY OVERVIEW:
 * 
 * | Data Type              | staleTime         | gcTime    | Notes                                      |
 * |------------------------|-------------------|-----------|-------------------------------------------|
 * | System Settings        | Infinity          | 24h       | Rarely changes, manual invalidation       |
 * | Plans                  | Infinity          | 24h       | Rarely changes, invalidate on admin edit  |
 * | Exchange Rates         | 1h (configurable) | 24h       | Matches backend refresh schedule          |
 * | User Profile           | 5min              | 30min     | Background refetch on navigation          |
 * | Events List            | 2min              | 10min     | Frequently updated                        |
 * | Admin Lists            | 30sec             | 5min      | Admin needs fresh data                    |
 * | Blog Posts (public)    | 5min              | 30min     | CDN cached, moderate freshness            |
 * 
 * MUTATION STRATEGY:
 * - invalidateQueries(): For data that may have related side effects
 * - setQueryData(): For optimistic updates where response = input
 */

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default: data is considered stale after 30 seconds
        staleTime: 30 * 1000,
        // Default: inactive data is garbage collected after 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed requests up to 3 times
        retry: 3,
        // Don't refetch on window focus in development (less noise)
        refetchOnWindowFocus: process.env.NODE_ENV === "production",
        // Refetch on reconnect
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  })
}

// Browser: create a singleton instance
// Server: create new instance per request (avoided via client-only import)
let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

// Export a singleton for direct imports (client-side only)
export const queryClient = getQueryClient()

// ============================================================================
// STALE TIME PRESETS - Import these in hooks for consistent caching
// ============================================================================

export const STALE_TIME = {
  /** Data that almost never changes (system settings, plans) */
  INFINITE: Infinity,
  
  /** Static reference data (counties, categories) - 1 hour */
  STATIC: 60 * 60 * 1000,
  
  /** Exchange rates - matches backend update schedule */
  EXCHANGE_RATES: 60 * 60 * 1000, // 1 hour
  
  /** User profile data - moderate freshness */
  PROFILE: 5 * 60 * 1000, // 5 minutes
  
  /** Lists that update frequently (events, posts) */
  LIST: 2 * 60 * 1000, // 2 minutes
  
  /** Admin data - needs to be fresher */
  ADMIN: 30 * 1000, // 30 seconds
  
  /** Real-time or collaborative data */
  REALTIME: 0,
} as const

export const GC_TIME = {
  /** Long-lived cache for static data */
  LONG: 24 * 60 * 60 * 1000, // 24 hours
  
  /** Standard cache lifetime */
  STANDARD: 30 * 60 * 1000, // 30 minutes
  
  /** Short cache for frequently changing data */
  SHORT: 5 * 60 * 1000, // 5 minutes
} as const

// ============================================================================
// INVALIDATION HELPERS - Standardized query invalidation
// ============================================================================

/** Invalidate all plan-related queries */
export function invalidatePlans() {
  if (queryClient) {
    queryClient.invalidateQueries({ queryKey: ["plans"] })
  }
}
