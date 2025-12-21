import { z } from "zod"
import {
  UiPermissionsSchema,
  AdminAccessSchema,
  MemberProfileSchema,
  AuthUserSchema,
} from "@/contracts/auth.contract"

// Role and Permission schemas (kept for backwards compatibility if needed elsewhere)
export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  guard_name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  guard_name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

// User schema aligned with SecureUserResource from backend
// Leveraging the contract schema directly to ensure compatibility with Store
export const UserSchema = AuthUserSchema;

export const LoginResponseSchema = z.object({
  user: UserSchema,
  access_token: z.string(),
  expires_at: z.string().optional().nullable(),
  email_verified: z.boolean().optional(),
  // 2FA fields - when requires2fa is true, user and access_token may be partial
  requires2fa: z.boolean().optional(),
  email: z.string().optional(),
  needsVerification: z.boolean().optional(),
})

export const SignupResponseSchema = z.object({
  user: UserSchema,
})

export const SendResetEmailSchema = z.object({
  message: z.string().optional(),
})

export const ResetPasswordSchema = z.object({
  message: z.string().optional(),
})

export type Role = z.infer<typeof RoleSchema>
export type Permission = z.infer<typeof PermissionSchema>
export type User = z.infer<typeof UserSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>
export type SignupResponse = z.infer<typeof SignupResponseSchema>

export default {
  UserSchema,
  LoginResponseSchema,
  SignupResponseSchema,
}

