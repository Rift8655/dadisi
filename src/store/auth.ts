import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser, UiPermissions, AdminAccess } from "@/contracts/auth.contract";
import { encryptToken, decryptToken, clearEncryptionCache } from "@/lib/crypto";

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
        
        logout: () => {
          // Clear encryption cache on logout for security
          clearEncryptionCache();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            uiPermissions: null,
            adminAccess: null
          });
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
          // NEVER persist isLoading - it should reset on page load
          uiPermissions: state.uiPermissions,
          adminAccess: state.adminAccess,
          // Don't persist dialog state
        }),
        onRehydrateStorage: () => (state) => {
          // Recalculate isAuthenticated after rehydration
          if (state) {
            state.isAuthenticated = !!state.user && !!state.token;
          }
        }
      }
    ),
    { name: "auth-store" }
  )
);
