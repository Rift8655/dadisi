"use client";

import React from "react";
import { useAuth } from "@/store/auth";
import type { UiPermissions } from "@/contracts/auth.contract";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: keyof UiPermissions;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  fallback = null,
}) => {
  const { hasUIPermission, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Or a loading spinner if preferred, but usually silence is better for atomic guards
  }
  
  if (!hasUIPermission(requiredPermission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
