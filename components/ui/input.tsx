
import * as React from "react"
import { InputHTMLAttributes } from 'react'
import { cva } from "class-variance-authority"


interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'id' | 'children'
  > {
  label?: string
}

const inputVariants = cva(
  "",
  {
    variants: {
      variant: {
       primary: "text-black bg-snow-flurry-200 rounded-md"
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
)

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, ...props},
    ref
  ) => {
    return (
      <div className="w-full" ref={ref} >
        {label && 
          <div className="flex gap-2 p-2">
            <span className="text-xs font-normal font-helvetica text-woodsmoke-100 opacity-80">
              {label}
            </span>
          </div>
        }
        <input 
          className="flex bg-transparent w-full p-2 items-center flex-col text-base font-helvetica font-normal text-snow-flurry-200 border border-snow-flurry-200 rounded ring-0 focus:ring-0 outline:none justify-center"
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
