import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/25 focus-visible:border-[#4F46E5] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#4F46E5] text-white shadow-[0_1px_2px_rgba(23,32,51,0.06)] hover:bg-[#4338CA]",
        destructive:
          "bg-[#DC2626] text-white shadow-[0_1px_2px_rgba(23,32,51,0.06)] hover:bg-red-700",
        outline:
          "border border-[#E2E8F0] bg-white text-[#172033] shadow-[0_1px_2px_rgba(23,32,51,0.03)] hover:bg-[#F8FAFC] hover:border-slate-300",
        secondary:
          "bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200/70 hover:bg-indigo-100/70",
        ghost:
          "text-[#64748B] hover:bg-slate-100 hover:text-[#172033]",
        link:
          "text-[#4F46E5] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-5 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
