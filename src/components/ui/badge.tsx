import React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger"
}

export function Badge({ children, className = "", variant = "default", ...rest }: BadgeProps) {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-sm font-medium"
  const variantClass =
    variant === "success"
      ? "bg-green-100 text-green-800"
      : variant === "warning"
      ? "bg-yellow-100 text-yellow-800"
      : variant === "danger"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-800"

  return (
    <span className={`${base} ${variantClass} ${className}`} {...rest}>
      {children}
    </span>
  )
}

export default Badge
