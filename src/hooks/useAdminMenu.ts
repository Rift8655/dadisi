import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api-admin";

export function useAdminMenu(enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "menu"],
    queryFn: () => adminApi.getMenu(),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
