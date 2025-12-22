"use client"

import { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { Plus, Loader2, AlertCircle } from "lucide-react"
import { authApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Swal from "sweetalert2"

interface PasskeyRegistrationProps {
  onSuccess?: () => void
}

/**
 * Component for registering new passkeys using WebAuthn.
 * Checks for browser support and guides user through registration.
 */
export function PasskeyRegistration({ onSuccess }: PasskeyRegistrationProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [passkeyName, setPasskeyName] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check WebAuthn support on mount
  useEffect(() => {
    const checkSupport = async () => {
      if (
        window.PublicKeyCredential &&
        typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function"
      ) {
        try {
          const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          setIsSupported(available || !!window.PublicKeyCredential)
        } catch {
          setIsSupported(!!window.PublicKeyCredential)
        }
      } else {
        setIsSupported(false)
      }
    }
    checkSupport()
  }, [])

  // Get registration options mutation
  const optionsMutation = useMutation({
    mutationFn: () => authApi.passkeys.registerOptions(),
  })

  // Handle registration flow
  const handleRegister = async () => {
    if (!passkeyName.trim()) {
      setError("Please enter a name for this passkey")
      return
    }

    setError(null)
    setIsRegistering(true)

    try {
      // Step 1: Get options from server
      const options = await authApi.passkeys.registerOptions()
      
      // Step 2: Create credential using WebAuthn API
      // Convert base64 challenge to ArrayBuffer
      const challengeBuffer = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0))
      const userIdBuffer = Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0))

      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge: challengeBuffer,
        rp: {
          id: options.rp.id,
          name: options.rp.name,
        },
        user: {
          id: userIdBuffer,
          name: options.user.name,
          displayName: options.user.displayName,
        },
        pubKeyCredParams: options.pubKeyCredParams.map(p => ({
          type: p.type as PublicKeyCredentialType,
          alg: p.alg,
        })),
        timeout: options.timeout,
        attestation: options.attestation as AttestationConveyancePreference,
        authenticatorSelection: {
          residentKey: options.authenticatorSelection.residentKey as ResidentKeyRequirement,
          userVerification: options.authenticatorSelection.userVerification as UserVerificationRequirement,
        },
      }

      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions,
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error("Failed to create credential")
      }

      // Step 3: Send credential to server
      const response = credential.response as AuthenticatorAttestationResponse
      
      await authApi.passkeys.register({
        name: passkeyName,
        credential: {
          id: credential.id,
          rawId: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(credential.rawId)))),
          type: credential.type,
          response: {
            clientDataJSON: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(response.clientDataJSON)))),
            attestationObject: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(response.attestationObject)))),
          },
        },
      })

      // Success!
      setDialogOpen(false)
      setPasskeyName("")
      Swal.fire({
        icon: "success",
        title: "Passkey Added!",
        text: `Your passkey "${passkeyName}" has been registered.`,
        timer: 2500,
        showConfirmButton: false,
      })
      onSuccess?.()

    } catch (err: any) {
      console.error("Passkey registration error:", err)
      
      if (err.name === "NotAllowedError") {
        setError("Registration was cancelled or not allowed.")
      } else if (err.name === "InvalidStateError") {
        setError("This device is already registered.")
      } else {
        setError(err.message || "Failed to register passkey")
      }
    } finally {
      setIsRegistering(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        Passkeys are not supported in this browser
      </div>
    )
  }

  return (
    <>
      <Button variant="outline" onClick={() => setDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Passkey
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a Passkey</DialogTitle>
            <DialogDescription>
              Create a passkey to sign in securely with your fingerprint, face, or security key.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="passkey-name">Passkey Name</Label>
              <Input
                id="passkey-name"
                placeholder="e.g., MacBook Pro, Yubikey, iPhone"
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
                disabled={isRegistering}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Give this passkey a name so you can identify it later.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleRegister}
              disabled={!passkeyName.trim() || isRegistering}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Passkey...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Passkey
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
