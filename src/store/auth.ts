import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { AuthUser, UiPermissions, AdminAccess } from "@/contracts/auth.contract";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // UI Permissions & Admin Access (derived from user)
  uiPermissions: UiPermissions | null;
  adminAccess: AdminAccess | null;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  setToken: (token: string | null) => void;
  setAuth: (user: AuthUser | null, token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
  
  // Helpers
  hasUIPermission: (permission: keyof UiPermissions) => boolean;
  canAccessAdmin: () => boolean;
}

export const useAuth = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false, // Don't persist loading state - always start as false
        uiPermissions: null,
        adminAccess: null,
        
        setUser: (user) => set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false,
          uiPermissions: user?.ui_permissions || null,
          adminAccess: user?.admin_access || null
        }),

        updateUser: (partialUser) => set((state) => ({
             user: state.user ? { ...state.user, ...partialUser } : null
        })),
        
        setToken: (token) => set({ token }),
        
        setAuth: (user, token) => set({
          user,
          token,
          isAuthenticated: !!user && !!token,
          isLoading: false,
          uiPermissions: user?.ui_permissions || null,
          adminAccess: user?.admin_access || null
        }),
        
        setIsLoading: (loading) => set({ isLoading: loading }),
        
        logout: () => set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          uiPermissions: null,
          adminAccess: null
        }),
        
        hasUIPermission: (permission) => {
          const perms = get().uiPermissions;
          return perms ? perms[permission] === true : false;
        },
        
        canAccessAdmin: () => {
          const access = get().adminAccess;
          return access ? access.can_access_admin === true : false;
        }
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          // NEVER persist isLoading - it should reset on page load
          uiPermissions: state.uiPermissions,
          adminAccess: state.adminAccess
        })
      }
    ),
    { name: "auth-store" }
  )
);
