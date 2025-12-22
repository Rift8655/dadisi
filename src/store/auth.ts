import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser, UiPermissions, AdminAccess } from "@/contracts/auth.contract";
import { encryptToken, decryptToken, clearEncryptionCache } from "@/lib/crypto";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  expiresAt: string | null;
  
  // UI Permissions & Admin Access (derived from user)
  uiPermissions: UiPermissions | null;
  adminAccess: AdminAccess | null;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  setToken: (token: string | null, expiresAt?: string | null) => void;
  setAuth: (user: AuthUser | null, token: string | null, expiresAt?: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
  
  // Helpers
  hasUIPermission: (permission: keyof UiPermissions) => boolean;
  canAccessAdmin: () => boolean;
  isTokenExpiringSoon: (bufferMinutes?: number) => boolean;
  
  // UI State
  authDialogState: { open: boolean; tab: "signin" | "register" };
  setAuthDialogOpen: (open: boolean, tab?: "signin" | "register") => void;
}

/**
 * Custom storage that encrypts the token before storing in localStorage.
 * Other fields are stored as-is.
 */
const encryptedStorage = createJSONStorage<Partial<AuthState>>(() => ({
  getItem: async (name: string): Promise<string | null> => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    
    try {
      const state = JSON.parse(str);
      // Decrypt token if present
      if (state.state?.token) {
        state.state.token = await decryptToken(state.state.token);
      }
      return JSON.stringify(state);
    } catch (e) {
      console.error("Failed to decrypt auth state:", e);
      return str;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const state = JSON.parse(value);
      // Encrypt token if present
      if (state.state?.token) {
        state.state.token = await encryptToken(state.state.token);
      }
      localStorage.setItem(name, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to encrypt auth state:", e);
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
}));

export const useAuth = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false, // Don't persist loading state - always start as false
        expiresAt: null,
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
        
        setToken: (token, expiresAt) => set({ 
          token, 
          expiresAt: expiresAt || null 
        }),
        
        setAuth: (user, token, expiresAt) => set({
          user,
          token,
          expiresAt: expiresAt || null,
          isAuthenticated: !!user && !!token,
          isLoading: false,
          uiPermissions: user?.ui_permissions || null,
          adminAccess: user?.admin_access || null
        }),
        
        setIsLoading: (loading) => set({ isLoading: loading }),
        
        logout: () => {
          // Clear encryption cache on logout for security
          clearEncryptionCache();
          set({
            user: null,
            token: null,
            expiresAt: null,
            isAuthenticated: false,
            isLoading: false,
            uiPermissions: null,
            adminAccess: null
          });
        },

        refreshSession: async () => {
          try {
            const { authApi } = await import("@/lib/api");
            const response = await authApi.refresh();
            if (response && response.access_token) {
              get().setAuth(response.user as any, response.access_token, response.expires_at);
            }
          } catch (e) {
            console.error("Silent refresh failed:", e);
            // If refresh fails with 401, the interceptor in api.ts will handle logout
          }
        },

        isTokenExpiringSoon: (bufferMinutes = 30) => {
          const expiresAt = get().expiresAt;
          if (!expiresAt) return false;
          
          const expiryDate = new Date(expiresAt);
          const now = new Date();
          const bufferTime = bufferMinutes * 60 * 1000;
          
          return expiryDate.getTime() - now.getTime() < bufferTime;
        },
        
        hasUIPermission: (permission) => {
          const perms = get().uiPermissions;
          return perms ? perms[permission] === true : false;
        },
        
        canAccessAdmin: () => {
          const access = get().adminAccess;
          return access ? access.can_access_admin === true : false;
        },

        // Auth Dialog State
        authDialogState: { open: false, tab: "signin" },
        setAuthDialogOpen: (open, tab = "signin") => set({ authDialogState: { open, tab } })
      }),
      {
        name: "auth-storage",
        storage: encryptedStorage,
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          expiresAt: state.expiresAt,
          // NEVER persist isLoading - it should reset on page load
          uiPermissions: state.uiPermissions,
          adminAccess: state.adminAccess,
          // Don't persist dialog state
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Recalculate isAuthenticated
            state.isAuthenticated = !!state.user && !!state.token;
            
            // Check if token already expired
            if (state.expiresAt && new Date(state.expiresAt) < new Date()) {
              console.warn("Session expired on rehydration");
              state.logout();
            }
          }
        }
      }
    ),
    { name: "auth-store" }
  )
);
