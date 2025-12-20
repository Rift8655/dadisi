"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { QRCodeSVG } from "qrcode.react"
import {
  Shield,
  Smartphone,
  Key,
  Copy,
  Check,
  Trash2,
  Plus,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react"
import { authApi } from "@/lib/api"
import { useAuth } from "@/store/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Swal from "sweetalert2"
import { PasskeyRegistration } from "@/components/security/PasskeyRegistration"

export default function SecurityPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // TOTP State
  const [totpSetupOpen, setTotpSetupOpen] = useState(false)
  const [totpCode, setTotpCode] = useState("")
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)
  const [disablePassword, setDisablePassword] = useState("")
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)

  // Passkey State
  const [passkeyName, setPasskeyName] = useState("")
  const [deletePasskeyId, setDeletePasskeyId] = useState<number | null>(null)

  // Check if 2FA is enabled
  const is2faEnabled = (user as any)?.two_factor_enabled ?? false

  // Fetch passkeys
  const { data: passkeysData, isLoading: loadingPasskeys } = useQuery({
    queryKey: ["passkeys"],
    queryFn: () => authApi.passkeys.list(),
  })

  // Enable TOTP mutation
  const enableTotpMutation = useMutation({
    mutationFn: () => authApi.twoFactor.enable(),
  })

  // Verify TOTP mutation
  const verifyTotpMutation = useMutation({
    mutationFn: (code: string) => authApi.twoFactor.verify(code),
    onSuccess: (data) => {
      setRecoveryCodes(data.recovery_codes)
      setShowRecoveryCodes(true)
      setTotpSetupOpen(false)
      queryClient.invalidateQueries({ queryKey: ["auth-user"] })
      Swal.fire({
        icon: "success",
        title: "2FA Enabled!",
        text: "Please save your recovery codes.",
        timer: 3000,
      })
    },
    onError: (err: any) => {
      Swal.fire("Error", err.message || "Invalid code", "error")
    },
  })

  // Disable TOTP mutation
  const disableTotpMutation = useMutation({
    mutationFn: (password: string) => authApi.twoFactor.disable(password),
    onSuccess: () => {
      setDisableDialogOpen(false)
      setDisablePassword("")
      queryClient.invalidateQueries({ queryKey: ["auth-user"] })
      Swal.fire({
        icon: "success",
        title: "2FA Disabled",
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (err: any) => {
      Swal.fire("Error", err.message || "Invalid password", "error")
    },
  })

  // Delete passkey mutation
  const deletePasskeyMutation = useMutation({
    mutationFn: (id: number) => authApi.passkeys.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passkeys"] })
      setDeletePasskeyId(null)
      Swal.fire({
        icon: "success",
        title: "Passkey removed",
        timer: 1500,
        showConfirmButton: false,
      })
    },
  })

  // Handle TOTP setup
  const handleStartTotpSetup = async () => {
    setTotpSetupOpen(true)
    enableTotpMutation.mutate()
  }

  // Copy recovery codes
  const handleCopyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"))
    Swal.fire({
      icon: "success",
      title: "Copied!",
      text: "Recovery codes copied to clipboard",
      timer: 1500,
      showConfirmButton: false,
    })
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Security Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account security and two-factor authentication.
        </p>
      </div>

      <div className="space-y-6">
        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Authenticator App</CardTitle>
                  <CardDescription>
                    Use an authenticator app like Google Authenticator or Authy
                  </CardDescription>
                </div>
              </div>
              {is2faEnabled ? (
                <Badge variant="success">Enabled</Badge>
              ) : (
                <Badge variant="secondary">Disabled</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {is2faEnabled ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Your account is protected with two-factor authentication.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDisableDialogOpen(true)}
                >
                  Disable 2FA
                </Button>
              </div>
            ) : (
              <Button onClick={handleStartTotpSetup}>
                <Plus className="h-4 w-4 mr-2" />
                Set Up 2FA
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Passkeys */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Passkeys</CardTitle>
                <CardDescription>
                  Sign in securely with your fingerprint, face, or security key
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingPasskeys ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading passkeys...
              </div>
            ) : passkeysData?.passkeys?.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No passkeys registered yet.
              </p>
            ) : (
              <div className="space-y-2">
                {passkeysData?.passkeys?.map((passkey) => (
                  <div
                    key={passkey.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{passkey.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(passkey.created_at).toLocaleDateString()}
                        {passkey.last_used_at && (
                          <> · Last used {new Date(passkey.last_used_at).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeletePasskeyId(passkey.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <PasskeyRegistration
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ["passkeys"] })}
            />
          </CardContent>
        </Card>

        {/* Recovery Codes Display */}
        {showRecoveryCodes && recoveryCodes.length > 0 && (
          <Card className="border-warning">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-warning" />
                Recovery Codes
              </CardTitle>
              <CardDescription>
                Save these codes in a secure place. Each code can only be used once.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 p-4 bg-muted rounded-lg font-mono text-sm">
                {recoveryCodes.map((code, index) => (
                  <div key={index} className="text-center">
                    {code}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCopyRecoveryCodes}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Codes
                </Button>
                <Button variant="secondary" onClick={() => setShowRecoveryCodes(false)}>
                  I've Saved These Codes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* TOTP Setup Dialog */}
      <Dialog open={totpSetupOpen} onOpenChange={setTotpSetupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app.
            </DialogDescription>
          </DialogHeader>

          {enableTotpMutation.isPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : enableTotpMutation.data ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <QRCodeSVG value={enableTotpMutation.data.qr_code_url} size={200} />
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Or enter this code manually:
                </p>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {enableTotpMutation.data.secret}
                </code>
              </div>

              <div>
                <Label htmlFor="totp-code">Verification Code</Label>
                <Input
                  id="totp-code"
                  placeholder="Enter 6-digit code"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  maxLength={6}
                />
              </div>

              <Button
                className="w-full"
                onClick={() => verifyTotpMutation.mutate(totpCode)}
                disabled={totpCode.length !== 6 || verifyTotpMutation.isPending}
              >
                {verifyTotpMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify & Enable"
                )}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the extra layer of security from your account.
              Enter your password to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="disable-password">Password</Label>
            <Input
              id="disable-password"
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => disableTotpMutation.mutate(disablePassword)}
              disabled={!disablePassword || disableTotpMutation.isPending}
            >
              {disableTotpMutation.isPending ? "Disabling..." : "Disable 2FA"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Passkey Dialog */}
      <AlertDialog open={!!deletePasskeyId} onOpenChange={() => setDeletePasskeyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Passkey?</AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer be able to use this passkey to sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => deletePasskeyId && deletePasskeyMutation.mutate(deletePasskeyId)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
