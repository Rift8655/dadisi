"use client"

import Swal from 'sweetalert2'

// Success notification - requires user confirmation
export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    showConfirmButton: true,
    confirmButtonText: 'Continue',
    confirmButtonColor: '#6D28D9',
    allowOutsideClick: true,
    allowEscapeKey: true,
  })
}

// Error notification - requires user confirmation
export const showError = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc2626', // red-600
    allowOutsideClick: true,
    allowEscapeKey: true,
  })
}

// Info notification - requires user confirmation
export const showInfo = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#2563eb', // blue-600
    allowOutsideClick: true,
    allowEscapeKey: true,
  })
}

// Warning notification - requires user confirmation
export const showWarning = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#d97706', // amber-600
    allowOutsideClick: true,
    allowEscapeKey: true,
  })
}

// Confirmation dialog
export const showConfirm = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    allowOutsideClick: false,
    allowEscapeKey: false,
  })
}
