import * as React from "react"

import { cn } from "@/lib/utils"

interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, ...props }, ref) => (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        className={cn(
          "peer h-5 w-9 rounded-full bg-gray-200 transition-colors checked:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "cursor-pointer appearance-none",
          "before:block before:h-4 before:w-4 before:rounded-full before:bg-white before:shadow-md before:transition-transform before:content-['']",
          "checked:before:translate-x-4 checked:before:translate-y-0.5",
          "before:translate-x-0.5 before:translate-y-0.5",
          className
        )}
        ref={ref}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
    </div>
  )
)
Switch.displayName = "Switch"

export { Switch }
