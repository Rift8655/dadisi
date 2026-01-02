"use client"

import { useState, useCallback } from "react"
import { QrScanner } from "./QrScanner"
import { useAdminEventAttendance, useAdminEventAttendanceStats, useAdminEventMutations } from "@/hooks/useAdminEvents"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, QrCode, UserCheck, Play, Square, Search } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Swal from "sweetalert2"

interface AttendanceTabProps {
  eventId: number
}

export function AttendanceTab({ eventId }: AttendanceTabProps) {
  const [manualToken, setManualToken] = useState("")
  const [isScannerActive, setIsScannerActive] = useState(false)
  const [lastScanned, setLastScanned] = useState<any>(null)
  
  const { data: attendees, isLoading: isListLoading } = useAdminEventAttendance(eventId)
  const { data: stats, isLoading: isStatsLoading } = useAdminEventAttendanceStats(eventId)
  const { scan } = useAdminEventMutations()

  const handleScan = useCallback(async (token: string) => {
    if (scan.isPending) return
    
    try {
      const result = await scan.mutateAsync({ id: eventId, token })
      if (result.success) {
        setLastScanned(result.attendee)
        Swal.fire({
          title: "Check-in Successful!",
          text: `${result.attendee.name} has been checked in.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end"
        })
      }
    } catch (error: any) {
       Swal.fire({
        title: "Scan Error",
        text: error.response?.data?.message || "Failed to check in.",
        icon: "error",
        toast: true,
        position: "top-end",
        timer: 3000
      })
    }
  }, [eventId, scan])

  const handleManualCheckIn = () => {
    if (!manualToken.trim()) return
    handleScan(manualToken.trim())
    setManualToken("")
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-primary" />
                      Attendance Scanner
                    </CardTitle>
                    <CardDescription>High-visibility QR scanning for entry check-in.</CardDescription>
                </div>
                <Button 
                    variant={isScannerActive ? "destructive" : "default"} 
                    size="sm"
                    onClick={() => setIsScannerActive(!isScannerActive)}
                    className="gap-2"
                >
                    {isScannerActive ? (
                        <><Square className="h-4 w-4" /> Stop Scanner</>
                    ) : (
                        <><Play className="h-4 w-4" /> Start Scanner</>
                    )}
                </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
             {isScannerActive ? (
                <div className="space-y-4">
                    <QrScanner onScan={handleScan} />
                    {lastScanned && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md animate-in fade-in slide-in-from-top-4">
                            <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                                <UserCheck className="h-4 w-4" />
                                Last Checked In: {lastScanned.name}
                            </p>
                            <p className="text-xs text-green-600">Type: {lastScanned.type} • {formatDate(lastScanned.time, true)}</p>
                        </div>
                    )}
                </div>
             ) : (
                <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/10 text-muted-foreground gap-4">
                    <QrCode className="h-16 w-16 opacity-20" />
                    <p className="text-sm">Scanner is currently inactive</p>
                    <Button variant="outline" onClick={() => setIsScannerActive(true)}>
                        Activate Camera
                    </Button>
                </div>
             )}
             
             <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase font-bold">Manual Entry Fallback</Label>
                <div className="flex gap-2">
                    <Input 
                       placeholder="Enter token manually (TKT-...)" 
                       value={manualToken} 
                       onChange={(e) => setManualToken(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleManualCheckIn()}
                    />
                    <Button onClick={handleManualCheckIn} disabled={scan.isPending}>
                      {scan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check-in"}
                    </Button>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Live Attendance Stats
            </CardTitle>
            <CardDescription>Real-time tracking of checked-in attendees.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isStatsLoading ? (
              <div className="flex items-center justify-center h-48">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-green-500/10 border-2 border-green-500/20">
                    <p className="text-xs font-bold text-green-700 uppercase mb-1">Attended</p>
                    <p className="text-4xl font-extrabold text-green-700">{stats?.attended || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-orange-500/10 border-2 border-orange-500/20">
                    <p className="text-xs font-bold text-orange-700 uppercase mb-1">Expected</p>
                    <p className="text-4xl font-extrabold text-orange-700">{stats?.total_registered || 0}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Checking In Status</span>
                    <span className="text-primary">{stats?.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-primary/20" 
                      style={{ width: `${stats?.percentage || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {stats?.remaining || 0} attendees still remaining to be checked in.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-semibold uppercase">Free RSVPs</p>
                        <div className="flex items-end gap-1">
                            <span className="text-xl font-bold">{stats?.breakdown?.registrations?.attended}</span>
                            <span className="text-sm text-muted-foreground mb-1">/ {stats?.breakdown?.registrations?.total}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-semibold uppercase">Paid Tickets</p>
                        <div className="flex items-end gap-1">
                            <span className="text-xl font-bold">{stats?.breakdown?.orders?.attended}</span>
                            <span className="text-sm text-muted-foreground mb-1">/ {stats?.breakdown?.orders?.total}</span>
                        </div>
                    </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Guest List Section */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Attendance History</CardTitle>
            <div className="relative w-full max-w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Filter list..." className="pl-9 h-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isListLoading ? (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border h-[450px] overflow-y-auto shadow-inner bg-muted/5">
              <Table>
                <TableHeader className="sticky top-0 bg-background shadow-sm z-20">
                  <TableRow>
                    <TableHead className="w-[300px]">Attendee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Check-in Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendees?.map((person: any) => (
                    <TableRow key={person.id} className={person.status === 'attended' ? 'bg-green-500/5 hover:bg-green-500/10' : ''}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{person.name}</span>
                          <span className="text-xs text-muted-foreground">{person.email || "Guest"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                          {person.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <Badge 
                           variant={person.status === 'attended' ? "default" : "outline"}
                           className={person.status === 'attended' ? 'bg-green-600 hover:bg-green-700' : ''}
                         >
                           {person.status}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono">
                        {person.checked_in_at ? formatDate(person.checked_in_at, true) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {attendees?.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                         No attendees found for this event yet.
                       </TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <label className={className}>{children}</label>
}
