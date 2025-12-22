import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/store/auth';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook that silently refreshes the auth token before it expires.
 * Should be used in the root layout or AuthProvider.
 */
export function useTokenRefresh() {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const setAuth = useAuth((s) => s.setAuth);
  const logout = useAuth((s) => s.logout);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const refreshToken = useCallback(async () => {
    // Prevent concurrent refresh attempts
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      // Dynamic import to avoid circular dependency
      const { authApi } = await import('@/lib/api');
      const response = await authApi.refresh();
      
      if (response?.user && response?.access_token) {
        // Update auth state with new token
        const authUser = response.user as import('@/contracts/auth.contract').AuthUser;
        setAuth(authUser, response.access_token);
      }
    } catch (error: unknown) {
      const err = error as { status?: number };
      // Only logout on explicit auth failure
      if (err?.status === 401) {
        logout();
        // Don't redirect here - let the 401 handler in api.ts do it
      }
      // Other errors (network issues) - silently fail, will retry next interval
    } finally {
      isRefreshingRef.current = false;
    }
  }, [setAuth, logout]);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear interval if user logs out
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial refresh on mount (validates current token)
    refreshToken();

    // Set up periodic refresh
    intervalRef.current = setInterval(refreshToken, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, refreshToken]);
}

export default useTokenRefresh;
