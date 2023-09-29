import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex text-center font-medium gap-2 font-[Helvetica_Neue] leading-[140%] text-base justify-center text-black items-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
       primary: "bg-snow-flurry-200",
       secondary: "bg-woodsmoke-100"
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
      maxWidth: {
        true: 'max-w-[264px]'
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      maxWidth: false
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: any
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading, icon, asChild = false, maxWidth = false, children, ...props },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className, maxWidth }))}
        ref={ref}
        {...props}
      >
        {icon && <span>{icon}</span>}
        <span>{loading ? 'Loading...' : children}</span>
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
