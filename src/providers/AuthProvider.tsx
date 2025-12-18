"use client";

import { useEffect } from "react";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useAuth } from "@/store/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useAuth((s) => s.token);
  const { data, isLoading, isError } = useAuthMe();
  const setUser = useAuth((s) => s.setUser);
  const setIsLoading = useAuth((s) => s.setIsLoading);
  const logout = useAuth((s) => s.logout);

  useEffect(() => {
    // Only update if we have a token (user is logged in)
    if (token) {
      if (data) {
        // Update user data but preserve the token
        setUser(data);
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
  }, [data, isLoading, isError, token, setUser, setIsLoading, logout]);

  return <>{children}</>;
}
