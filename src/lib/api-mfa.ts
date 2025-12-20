/**
 * MFA API - Two-Factor Authentication endpoints
 */

import { api } from "@/lib/api";

// Types
export interface TotpEnableResponse {
  secret: string;
  qr_code_url: string;
}

export interface TotpVerifyResponse {
  message: string;
  recovery_codes: string[];
}

export interface RecoveryCodesResponse {
  recovery_codes: string[];
}

export interface Passkey {
  id: number;
  name: string;
  created_at: string;
  last_used_at: string | null;
}

export interface PasskeysListResponse {
  passkeys: Passkey[];
}

export interface PasskeyRegisterOptions {
  challenge: string;
  rp: { name: string; id: string };
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: Array<{ type: string; alg: number }>;
  timeout: number;
  attestation: string;
  authenticatorSelection: {
    residentKey: string;
    userVerification: string;
  };
}

export interface PasskeyAuthOptions {
  challenge: string;
  timeout: number;
  rpId: string;
  allowCredentials: Array<{ id: string; type: string; transports?: string[] }>;
}

// TOTP API
export const totpApi = {
  /**
   * Start TOTP setup - get secret and QR code
   */
  enable: () =>
    api.post<TotpEnableResponse>("/api/auth/2fa/totp/enable"),

  /**
   * Verify TOTP code and enable 2FA
   */
  verify: (code: string) =>
    api.post<TotpVerifyResponse>("/api/auth/2fa/totp/verify", { code }),

  /**
   * Disable TOTP 2FA
   */
  disable: (password: string) =>
    api.post<{ message: string }>("/api/auth/2fa/totp/disable", { password }),

  /**
   * Validate TOTP at login
   */
  validateCode: (email: string, code: string) =>
    api.post<{ user: unknown; access_token: string }>(
      "/api/auth/2fa/totp/validate",
      { email, code }
    ),

  /**
   * Get recovery codes
   */
  getRecoveryCodes: (password: string) =>
    api.post<RecoveryCodesResponse>("/api/auth/2fa/totp/recovery-codes", { password }),

  /**
   * Regenerate recovery codes
   */
  regenerateRecoveryCodes: (password: string) =>
    api.post<RecoveryCodesResponse>("/api/auth/2fa/totp/regenerate-recovery-codes", { password }),
};

// Passkeys API
export const passkeysApi = {
  /**
   * Get registration options for new passkey
   */
  registerOptions: () =>
    api.post<PasskeyRegisterOptions>("/api/auth/passkeys/register/options"),

  /**
   * Register a new passkey
   */
  register: (data: { name: string } & Record<string, unknown>) =>
    api.post<{ message: string; passkey: Passkey }>("/api/auth/passkeys/register", data),

  /**
   * List user's passkeys
   */
  list: () =>
    api.get<PasskeysListResponse>("/api/auth/passkeys"),

  /**
   * Delete a passkey
   */
  remove: (id: number) =>
    api.delete<{ message: string }>(`/api/auth/passkeys/${id}`),

  /**
   * Get authentication options (for login)
   */
  authenticateOptions: (email: string) =>
    api.post<PasskeyAuthOptions>("/api/auth/passkeys/authenticate/options", { email }),

  /**
   * Authenticate with passkey
   */
  authenticate: (data: Record<string, unknown>) =>
    api.post<{ user: unknown; access_token: string }>("/api/auth/passkeys/authenticate", data),
};

// Combined MFA API
export const mfaApi = {
  totp: totpApi,
  passkeys: passkeysApi,
};
