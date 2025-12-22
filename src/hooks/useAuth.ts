import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "@/lib/api"
import { useAuth as useAuthStore } from "@/store/auth"

export type LoginPayload = {
  email: string;
  password: string;
  remember_me?: boolean;
};

export type SignupPayload = {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export function useLogin() {
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((s) => s.setAuth)
  
  return useMutation({
    mutationFn: (data: LoginPayload) => authApi.login(data),
    onSuccess: async (data) => {
      // Check if 2FA is required - don't set auth yet
      if ((data as any).requires_2fa) {
        return {
          requires2fa: true,
          email: (data as any).email,
          needsVerification: false,
        }
      }

      // Normal login flow
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
      
      // Store both user and token
      const authUser = data.user as unknown as import("@/contracts/auth.contract").AuthUser;
      setAuth(authUser, data.access_token)

      // Return data for the component (AuthDialog expects { user, needsVerification })
      return {
        user: authUser,
        needsVerification: !data.email_verified,
        requires2fa: false,
      }
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const storeLogout = useAuthStore((s) => s.logout)

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: async () => {
      await queryClient.clear() // Clear all cache
      storeLogout() // Clear auth state
    },
  })
}

export function useSignup() {
  return useMutation({
    mutationFn: (data: SignupPayload) => authApi.signup(data),
    onSuccess: (data) => {
      // Return user data for any component that needs it
      // Note: We don't auto-login here because the user needs to verify their email first
      return data;
    },
  })
}

// Deprecated or Aliased hooks if needed for backward compact
// but sticking to new architecture is better.

export type ResetPasswordPayload = {
  email: string;
  password: string;
  password_confirmation: string;
  token: string;
};

export function useSendResetEmail() {
  return useMutation({
    mutationFn: (data: { email: string }) => authApi.sendResetEmail(data),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordPayload) => authApi.resetPassword(data),
  })
}
