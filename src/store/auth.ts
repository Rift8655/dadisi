import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
}

interface SignupPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface LoginPayload {
  email: string;
  password: string;
  remember_me?: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signup: (data: SignupPayload) => Promise<void>;
  login: (data: LoginPayload) => Promise<{ user: User; needsVerification: boolean }>;
  logout: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      signup: async (data: SignupPayload) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/api/auth/signup', data);
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Signup failed';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      login: async (data: LoginPayload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<{
            user: User;
            access_token: string;
            email_verified: boolean;
          }>('/api/auth/login', data);

          const token = response.access_token;
          const user = response.user;

          set({ token, user, isLoading: false });

          return {
            user,
            needsVerification: !user.email_verified_at,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/api/auth/logout');
          set({ token: null, user: null, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Logout failed';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      setToken: async (token: string) => {
        set({ token, isLoading: true, error: null });
        try {
          const user = await api.get<User>('/api/auth/user');
          set({ user, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
          set({ token: null, user: null, isLoading: false, error: errorMessage });
          throw error;
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
