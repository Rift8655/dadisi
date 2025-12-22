import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuth } from "@/store/auth";

export function useAuthMe() {
  const token = useAuth((s) => s.token);
  
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.getMe(),
    enabled: !!token, // Only fetch if we have a token
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on 401/403
  });
}
