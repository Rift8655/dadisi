"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import { Loader2 } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  const isLoading = useAuth((s) => s.isLoading);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !user.ui_permissions.can_access_admin_panel)) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
     return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
     );
  }

  // If not loading and not authorized, effect will redirect.
  // We return null or fallback during the tick.
  if (!user || !user.ui_permissions.can_access_admin_panel) {
      return null; 
  }

  return <>{children}</>;
}
