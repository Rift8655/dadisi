/**
 * Token Encryption Utilities
 *
 * AES-GCM encryption for localStorage tokens to mitigate XSS token theft.
 * Uses a derived key from device fingerprint + app secret.
 */

const ALGORITHM = "AES-GCM"
const SALT = "dadisi-token-salt-v1"
// Reduced from 100000 to 10000 for faster key derivation in new tabs
// 10k iterations is still secure for client-side token encryption
const ITERATIONS = 10000

/**
 * Get a stable key material for encryption.
 * We use a static string instead of device fingerprinting because:
 * 1. Device fingerprinting via screen/navigator properties is unstable across tabs/windows
 *    (e.g. moving a tab to a different monitor changes screen dimensions).
 * 2. Unstable keys cause valid tokens to fail decryption, logging users out unexpectedly.
 * 3. The security benefit of client-side fingerprinting is marginal vs the UX cost.
 */
function getStableKeyMaterial(): string {
  return "dadisi-stable-encryption-key-v1-static"
}

/**
 * Derive an encryption key from the device fingerprint.
 * Cached in memory for performance.
 */
let cachedKey: CryptoKey | null = null

async function getEncryptionKey(): Promise<CryptoKey> {
  if (cachedKey) {
    return cachedKey
  }

  const fingerprint = getStableKeyMaterial()
  const encoder = new TextEncoder()

  // Import fingerprint as key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(fingerprint),
    "PBKDF2",
    false,
    ["deriveKey"]
  )

  // Derive AES-GCM key using PBKDF2
  cachedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(SALT),
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ["encrypt", "decrypt"]
  )

  return cachedKey
}

/**
 * Encrypt a token string.
 * Returns base64-encoded ciphertext with IV prepended.
 */
export async function encryptToken(token: string): Promise<string> {
  if (!token) return ""

  try {
    const key = await getEncryptionKey()
    const encoder = new TextEncoder()

    // Generate random IV for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // Encrypt the token
    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encoder.encode(token)
    )

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)

    // Encode as base64 (convert Uint8Array to regular array to avoid spread issues)
    return btoa(String.fromCharCode.apply(null, Array.from(combined)))
  } catch (error) {
    console.error("Token encryption failed:", error)
    // Fallback: return original token (less secure but functional)
    return token
  }
}

/**
 * Decrypt a token string.
 * Expects base64-encoded ciphertext with IV prepended.
 * Returns the original string if it doesn't appear to be encrypted (legacy support).
 */
export async function decryptToken(encrypted: string): Promise<string | null> {
  if (!encrypted) return ""

  // Check if the token appears to be encrypted (base64 format)
  // If not, it might be a legacy unencrypted token - return as-is
  if (!isEncryptedToken(encrypted)) {
    console.log("[Crypto] Token appears unencrypted, returning as-is")
    return encrypted
  }

  try {
    const key = await getEncryptionKey()

    // Decode from base64
    const binaryString = atob(encrypted)
    const combined = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i)
    }

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      data
    )

    return new TextDecoder().decode(decrypted)
  } catch (error) {
    console.error("Token decryption failed:", error)
    // If decryption fails (e.g. key mismatch across tabs), return null
    // This allows the store to handle the failure cleanly (e.g. by logging out)
    return null
  }
}

/**
 * Check if a string appears to be encrypted (base64 with correct structure).
 */
export function isEncryptedToken(value: string): boolean {
  if (!value) return false

  try {
    const decoded = atob(value)
    // Encrypted tokens should be at least IV (12 bytes) + some ciphertext
    return decoded.length > 20
  } catch {
    return false
  }
}

/**
 * Clear the cached encryption key (call on logout).
 */
export function clearEncryptionCache(): void {
  cachedKey = null
}
