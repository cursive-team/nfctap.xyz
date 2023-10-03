import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex text-center font-medium gap-2 font-helvetica leading-[140%] justify-center items-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background active:scale-90",
  {
    variants: {
      variant: {
       primary: "text-black bg-snow-flurry-200 rounded-md",
       secondary: "text-woodsmoke-100 border border-woodsmoke-100 rounded-md",
       link: 'border-b border-snow-flurry-200 py-2 align-start text-woodsmoke-100',
      },
      size: {
        default: "min-h-10 py-2 px-4 text-base",
        sm: "py-1 px-4 min-h-8 text-base",
        xs: "py-1 px-2 text-[13px]",
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
