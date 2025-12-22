/**
 * End-to-End Encryption for Secure Private Messaging
 * Uses Web Crypto API with RSA-OAEP + AES-GCM
 * 
 * Flow:
 * 1. Each user generates an RSA key pair on signup/first use
 * 2. Public key is stored on server, private key stays in browser
 * 3. Messages are encrypted with AES-GCM (random key per message)
 * 4. The AES key is encrypted with recipient's RSA public key
 * 5. Server never sees plaintext content
 */

const PRIVATE_KEY_STORAGE = "dadisi_messaging_private_key"
const PUBLIC_KEY_STORAGE = "dadisi_messaging_public_key"

// Export public key as JWK for storage/transmission
async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("jwk", key)
  return JSON.stringify(exported)
}

// Export private key as JWK for local storage
async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("jwk", key)
  return JSON.stringify(exported)
}

// Import public key from JWK string
async function importPublicKey(jwkString: string): Promise<CryptoKey> {
  const jwk = JSON.parse(jwkString)
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  )
}

// Import private key from JWK string
async function importPrivateKey(jwkString: string): Promise<CryptoKey> {
  const jwk = JSON.parse(jwkString)
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  )
}

/**
 * Generate a new RSA-OAEP key pair for the user.
 * The public key should be sent to the server.
 * The private key should be stored securely in the browser.
 */
export async function generateKeyPair(): Promise<{
  publicKeyJwk: string
  privateKeyJwk: string
}> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  )

  const publicKeyJwk = await exportPublicKey(keyPair.publicKey)
  const privateKeyJwk = await exportPrivateKey(keyPair.privateKey)

  return { publicKeyJwk, privateKeyJwk }
}

/**
 * Save keys to localStorage
 */
export function saveKeysToStorage(publicKeyJwk: string, privateKeyJwk: string): void {
  localStorage.setItem(PUBLIC_KEY_STORAGE, publicKeyJwk)
  localStorage.setItem(PRIVATE_KEY_STORAGE, privateKeyJwk)
}

/**
 * Get stored private key
 */
export function getStoredPrivateKey(): string | null {
  return localStorage.getItem(PRIVATE_KEY_STORAGE)
}

/**
 * Get stored public key
 */
export function getStoredPublicKey(): string | null {
  return localStorage.getItem(PUBLIC_KEY_STORAGE)
}

/**
 * Check if user has messaging encryption keys set up
 */
export function hasMessagingKeys(): boolean {
  return !!(getStoredPrivateKey() && getStoredPublicKey())
}

/**
 * Clear messaging keys from storage
 */
export function clearMessagingKeys(): void {
  localStorage.removeItem(PRIVATE_KEY_STORAGE)
  localStorage.removeItem(PUBLIC_KEY_STORAGE)
}

/**
 * Encrypt a message for a recipient using their public key.
 * Returns the encrypted blob, the encrypted AES key, and the nonce.
 */
export async function encryptMessage(
  message: string,
  recipientPublicKeyJwk: string
): Promise<{
  encryptedData: ArrayBuffer
  encryptedKeyPackage: string
  nonce: string
}> {
  // Generate a random AES-GCM key for this message
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  )

  // Generate a random nonce (IV)
  const nonce = crypto.getRandomValues(new Uint8Array(12))

  // Encrypt the message with AES-GCM
  const encoder = new TextEncoder()
  const messageBytes = encoder.encode(message)

  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    messageBytes
  )

  // Export the AES key
  const rawAesKey = await crypto.subtle.exportKey("raw", aesKey)

  // Encrypt the AES key with the recipient's RSA public key
  const recipientPublicKey = await importPublicKey(recipientPublicKeyJwk)
  const encryptedAesKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    recipientPublicKey,
    rawAesKey
  )

  return {
    encryptedData,
    encryptedKeyPackage: arrayBufferToBase64(encryptedAesKey),
    nonce: arrayBufferToBase64(nonce),
  }
}

/**
 * Decrypt a message using the user's private key.
 */
export async function decryptMessage(
  encryptedData: ArrayBuffer,
  encryptedKeyPackageBase64: string,
  nonceBase64: string
): Promise<string> {
  const privateKeyJwk = getStoredPrivateKey()
  if (!privateKeyJwk) {
    throw new Error("No private key found. Please set up encryption first.")
  }

  const privateKey = await importPrivateKey(privateKeyJwk)

  // Decrypt the AES key with our private RSA key
  const encryptedAesKey = base64ToArrayBuffer(encryptedKeyPackageBase64)
  const rawAesKey = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedAesKey
  )

  // Import the raw AES key
  const aesKey = await crypto.subtle.importKey(
    "raw",
    rawAesKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  )

  // Decrypt the message with AES-GCM
  const nonce = base64ToArrayBuffer(nonceBase64)
  const decryptedBytes = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    encryptedData
  )

  const decoder = new TextDecoder()
  return decoder.decode(decryptedBytes)
}

// Helper: ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Helper: Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}
