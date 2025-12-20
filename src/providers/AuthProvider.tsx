"use client";

import { useEffect } from "react";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useAuth } from "@/store/auth";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useAuth((s) => s.token);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const { data, isLoading, isError } = useAuthMe();
  const setUser = useAuth((s) => s.setUser);
  const setIsLoading = useAuth((s) => s.setIsLoading);
  const logout = useAuth((s) => s.logout);

  // Enable silent token refresh
  useTokenRefresh();

  useEffect(() => {
    // Only update if we have a token (user is logged in)
    if (token || isAuthenticated) {
      if (data) {
        // Update user data but preserve the token
        // Double cast needed due to Zod input/output type variance
        setUser(data as unknown as import("@/contracts/auth.contract").AuthUser);
      }
      
      // If we get an error (401/403), logout
      if (isError) {
        logout();
      }
    }
    
    // Update loading state
    if (!isLoading) {
      setIsLoading(false);
    }
  }, [data, isLoading, isError, token, isAuthenticated, setUser, setIsLoading, logout]);

  return <>{children}</>;
}
