import { QueryClient } from "@tanstack/react-query"

// Singleton QueryClient used across the app and from non-react modules
let _qc: QueryClient | null = null

export function getQueryClient() {
  if (!_qc) {
    _qc = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          gcTime: 1000 * 60 * 30,
          refetchOnWindowFocus: false,
        },
      },
    })
  }
  return _qc
}

export const queryClient = getQueryClient()

export function invalidatePlans() {
  try {
    queryClient.invalidateQueries({ queryKey: ["plans"] })
  } catch (e) {
    // ignore in environments where queryClient isn't fully initialized
  }
}
