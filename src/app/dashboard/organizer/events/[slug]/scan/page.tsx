"use client"

import { use, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  QrCode,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  Camera,
  User,
  Ticket,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { eventsApi } from "@/lib/api"
import type { Event } from "@/types"
import Swal from "sweetalert2"

interface ScanPageProps {
  params: Promise<{ slug: string }>
}

interface ScanResult {
  success: boolean
  message: string
  registration?: {
    id: number
    user_name: string
    ticket_name: string
    checked_in_at: string | null
  }
}

export default function ScanTicketsPage({ params }: ScanPageProps) {
  const { slug } = use(params)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [manualToken, setManualToken] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [lastScan, setLastScan] = useState<ScanResult | null>(null)
  const [scanCount, setScanCount] = useState(0)
  const [attendanceStats, setAttendanceStats] = useState<{
    total: number
    checked_in: number
    pending: number
  } | null>(null)

  useEffect(() => {
    loadEventAndStats()
  }, [slug])

  const loadEventAndStats = async () => {
    try {
      const eventData = await eventsApi.get(slug)
      setEvent(eventData)
      
      const stats = await eventsApi.getAttendanceStats(eventData.id)
      setAttendanceStats(stats)
    } catch (error) {
      console.error("Failed to load event:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScan = async (token: string) => {
    if (!event || !token.trim()) return
    
    setIsScanning(true)
    setLastScan(null)
    
    try {
      const result = await eventsApi.scanTicket(event.id, token.trim())
      setLastScan({
        success: true,
        message: result.message || "Check-in successful!",
        registration: {
          id: result.registration.id,
          user_name: result.registration.user?.username || result.registration.user?.email || "Unknown",
          ticket_name: result.registration.ticket?.name || "Attendee",
          checked_in_at: result.registration.check_in_at
        }
      })
      
      setScanCount(prev => prev + 1)
      setManualToken("")
      
      // Update stats
      const stats = await eventsApi.getAttendanceStats(event.id)
      setAttendanceStats(stats)

      // Play success vibration
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }
    } catch (error: any) {
      setLastScan({
        success: false,
        message: error.message || "Invalid or already used ticket.",
      })
      
      // Play error vibration
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100])
      }
    } finally {
      setIsScanning(false)
      // Focus back to input for next scan
      inputRef.current?.focus()
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleScan(manualToken)
  }

  if (isLoading) {
    return (
      <UserDashboardShell title="Scan Tickets">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </UserDashboardShell>
    )
  }

  if (!event) {
    return (
      <UserDashboardShell title="Scan Tickets">
        <div className="text-center py-20">
          <p className="text-destructive">Event not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </UserDashboardShell>
    )
  }

  return (
    <UserDashboardShell title={`Scan Tickets - ${event.title}`}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>

        {/* Event Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              {event.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Scan QR codes or enter ticket tokens to check in attendees.
            </p>
          </CardContent>
        </Card>

        {/* Attendance Stats */}
        {attendanceStats && (
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold">{attendanceStats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-green-600">{attendanceStats.checked_in}</p>
                <p className="text-xs text-muted-foreground">Checked In</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold">{attendanceStats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Manual Token Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enter Ticket Token</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                placeholder="Enter QR token or confirmation code..."
                disabled={isScanning}
                autoFocus
                className="font-mono"
              />
              <Button type="submit" disabled={isScanning || !manualToken.trim()}>
                {isScanning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">
              Use a barcode scanner or enter the code manually
            </p>
          </CardContent>
        </Card>

        {/* Last Scan Result */}
        {lastScan && (
          <Card className={lastScan.success 
            ? "border-green-500/50 bg-green-500/5"
            : "border-destructive/50 bg-destructive/5"
          }>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {lastScan.success ? (
                  <CheckCircle2 className="h-10 w-10 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-10 w-10 text-destructive flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg ${
                    lastScan.success ? "text-green-600" : "text-destructive"
                  }`}>
                    {lastScan.message}
                  </h3>
                  
                  {lastScan.registration && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{lastScan.registration.user_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        <span>{lastScan.registration.ticket_name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Stats */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Scanned this session: <strong>{scanCount}</strong></p>
        </div>
      </div>
    </UserDashboardShell>
  )
}
