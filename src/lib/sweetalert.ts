"use client"

import Swal from "sweetalert2"

// Detect if dark mode is active
const isDarkMode = () => {
  if (typeof window === "undefined") return false
  return document.documentElement.classList.contains("dark")
}

// Get theme-aware colors
const getThemeColors = () => {
  const dark = isDarkMode()
  return {
    background: dark ? "#1f2937" : "#ffffff",
    text: dark ? "#f9fafb" : "#111827",
    border: dark ? "#374151" : "#e5e7eb",
  }
}

// Custom classes for modern, theme-aware styling
export const getSwalCustomClass = () => ({
  container: "swal2-modern-container",
  popup: "swal2-modern-popup",
  title: "swal2-modern-title",
  htmlContainer: "swal2-modern-text",
  confirmButton: "swal2-modern-confirm",
  cancelButton: "swal2-modern-cancel",
  actions: "swal2-modern-actions",
})

// Inject modern styles that adapt to theme
if (typeof window !== "undefined") {
  const styleId = "swal2-modern-styles"
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style")
    style.id = styleId
    style.textContent = `
      /* High z-index to appear above Radix dialogs */
      .swal2-modern-container { 
        z-index: 9999 !important; 
      }
      
      /* Modern popup styling */
      .swal2-modern-popup {
        z-index: 9999 !important;
        border-radius: 1rem !important;
        padding: 2rem !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        border: 1px solid !important;
        backdrop-filter: blur(10px) !important;
      }
      
      /* Dark mode popup */
      .dark .swal2-modern-popup {
        background-color: rgb(31 41 55) !important;
        border-color: rgb(55 65 81) !important;
        color: rgb(249 250 251) !important;
      }
      
      /* Light mode popup */
      html:not(.dark) .swal2-modern-popup {
        background-color: rgb(255 255 255) !important;
        border-color: rgb(229 231 235) !important;
        color: rgb(17 24 39) !important;
      }
      
      /* Title styling */
      .swal2-modern-title {
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        margin-bottom: 0.5rem !important;
        line-height: 2rem !important;
      }
      
      .dark .swal2-modern-title {
        color: rgb(249 250 251) !important;
      }
      
      html:not(.dark) .swal2-modern-title {
        color: rgb(17 24 39) !important;
      }
      
      /* Text content */
      .swal2-modern-text {
        font-size: 0.95rem !important;
        line-height: 1.5rem !important;
        margin-top: 0.5rem !important;
      }
      
      .dark .swal2-modern-text {
        color: rgb(209 213 219) !important;
      }
      
      html:not(.dark) .swal2-modern-text {
        color: rgb(75 85 99) !important;
      }
      
      /* Icon styling - make them more subtle */
      .swal2-icon {
        margin: 1rem auto !important;
        border-width: 3px !important;
      }
      
      /* Actions container */
      .swal2-modern-actions {
        gap: 0.75rem !important;
        margin-top: 1.5rem !important;
      }
      
      /* Modern button base */
      .swal2-modern-confirm,
      .swal2-modern-cancel {
        border: none !important;
        border-radius: 0.5rem !important;
        padding: 0.625rem 1.5rem !important;
        font-size: 0.95rem !important;
        font-weight: 500 !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
        margin: 0 !important;
      }
      
      /* Confirm button hover */
      .swal2-modern-confirm:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      }
      
      /* Cancel button styling */
      .swal2-modern-cancel {
        background-color: transparent !important;
        border: 1px solid !important;
      }
      
      .dark .swal2-modern-cancel {
        border-color: rgb(75 85 99) !important;
        color: rgb(209 213 219) !important;
      }
      
      html:not(.dark) .swal2-modern-cancel {
        border-color: rgb(209 213 219) !important;
        color: rgb(55 65 81) !important;
      }
      
      .swal2-modern-cancel:hover {
        transform: translateY(-1px) !important;
      }
      
      .dark .swal2-modern-cancel:hover {
        background-color: rgb(55 65 81) !important;
        border-color: rgb(107 114 128) !important;
      }
      
      html:not(.dark) .swal2-modern-cancel:hover {
        background-color: rgb(249 250 251) !important;
        border-color: rgb(156 163 175) !important;
      }
      
      /* Remove default focus outline, add modern one */
      .swal2-modern-confirm:focus,
      .swal2-modern-cancel:focus {
        outline: none !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3) !important;
      }
    `
    document.head.appendChild(style)
  }
}

// Base configuration for all alerts
export const getBaseConfig = () => ({
  customClass: getSwalCustomClass(),
  allowOutsideClick: true,
  allowEscapeKey: true,
  showClass: {
    popup: "swal2-show",
    backdrop: "swal2-backdrop-show",
  },
  hideClass: {
    popup: "swal2-hide",
    backdrop: "swal2-backdrop-hide",
  },
})

// Success notification
export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    ...getBaseConfig(),
    icon: "success",
    title,
    text,
    confirmButtonText: "Continue",
    confirmButtonColor: "#10b981", // emerald-500
    iconColor: "#10b981",
  })
}

// Error notification
export const showError = (title: string, text?: string) => {
  return Swal.fire({
    ...getBaseConfig(),
    icon: "error",
    title,
    text,
    confirmButtonText: "OK",
    confirmButtonColor: "#ef4444", // red-500
    iconColor: "#ef4444",
  })
}

// Info notification
export const showInfo = (title: string, text?: string) => {
  return Swal.fire({
    ...getBaseConfig(),
    icon: "info",
    title,
    text,
    confirmButtonText: "OK",
    confirmButtonColor: "#3b82f6", // blue-500
    iconColor: "#3b82f6",
  })
}

// Warning notification
export const showWarning = (title: string, text?: string) => {
  return Swal.fire({
    ...getBaseConfig(),
    icon: "warning",
    title,
    text,
    confirmButtonText: "OK",
    confirmButtonColor: "#f59e0b", // amber-500
    iconColor: "#f59e0b",
  })
}

// Confirmation dialog
export const showConfirm = (title: string, text?: string) => {
  return Swal.fire({
    ...getBaseConfig(),
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    confirmButtonColor: "#3b82f6", // blue-500
    iconColor: "#3b82f6",
    allowOutsideClick: false,
    allowEscapeKey: false,
  })
}
