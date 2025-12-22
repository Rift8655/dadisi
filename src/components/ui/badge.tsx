import React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "secondary" | "outline" | "destructive"
}

export function Badge({ children, className = "", variant = "default", ...rest }: BadgeProps) {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-sm font-medium"
  
  const variantClasses: Record<string, string> = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    secondary: "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300",
    outline: "border border-gray-300 text-gray-700 bg-transparent dark:border-gray-600 dark:text-gray-300",
    destructive: "bg-red-500 text-white dark:bg-red-600",
  }

  const variantClass = variantClasses[variant] || variantClasses.default

  return (
    <span className={`${base} ${variantClass} ${className}`} {...rest}>
      {children}
    </span>
  )
}

export default Badge
