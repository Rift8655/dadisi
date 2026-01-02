"use client"

import { useEffect, useRef } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"

interface QrScannerProps {
  onScan: (token: string) => void
  fps?: number
  qrbox?: number | { width: number; height: number }
  aspectRatio?: number
  disableFlip?: boolean
}

export function QrScanner({ onScan, fps = 10, qrbox = 250, aspectRatio = 1, disableFlip = false }: QrScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    // Basic scanner config
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps, 
        qrbox, 
        aspectRatio, 
        disableFlip,
        rememberLastUsedCamera: true,
        supportedScanTypes: [0] // Html5QrcodeScanType.SCAN_TYPE_CAMERA
      },
      /* verbose= */ false
    )

    scanner.render(
      (decodedText) => {
        onScan(decodedText)
      },
      (error) => {
        // Optional: handle scan error (occurs on every frame without a code)
      }
    )

    scannerRef.current = scanner

    // Cleanup
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner", error)
        })
      }
    }
  }, [onScan, fps, qrbox, aspectRatio, disableFlip])

  return (
    <div className="relative">
      <div 
        id="qr-reader" 
        className="w-full mx-auto overflow-hidden rounded-lg border-2 border-primary/20 shadow-md bg-black" 
      />
      <div className="absolute inset-0 pointer-events-none border-2 border-primary/50 rounded-lg animate-pulse" />
    </div>
  )
}
