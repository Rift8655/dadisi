// SSR-safe storage helper for Zustand persist
export function getSSRStorage(): Storage | { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void; removeItem: (key: string) => void } {
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    return window.localStorage
  }

  // no-op in-memory shim for server
  const noop = {
    getItem: (_key: string) => null,
    setItem: (_key: string, _value: string) => {},
    removeItem: (_key: string) => {},
  }
  return noop
}

export default getSSRStorage
