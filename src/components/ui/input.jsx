import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#172033] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#172033] placeholder:text-[#64748B] focus-visible:outline-none focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-[#4F46E5]/15 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
