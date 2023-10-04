import * as React from "react";
import { InputHTMLAttributes } from "react";
import { cva } from "class-variance-authority";
import { FieldWrapper, FieldWrapperProps } from "./field";
import { cn } from "@/lib/utils";

interface InputProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      "size" | "id" | "children"
    >,
    Pick<FieldWrapperProps, "error"> {
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <FieldWrapper className="w-full" error={error}>
        <div className="w-full" ref={ref}>
          {label && (
            <div className="flex gap-2 p-2">
              <span className="text-xs font-normal font-helvetica text-woodsmoke-100 opacity-80">
                {label}
              </span>
            </div>
          )}
          <input
            className={cn(
              "flex bg-transparent w-full p-2 items-center flex-col text-base font-helvetica font-normal text-snow-flurry-200 rounded without-ring outline:none justify-center border",
              {
                "border-red-500": error,
                "border-snow-flurry-200": !error,
              }
            )}
            {...props}
          />
        </div>
      </FieldWrapper>
    );
  }
);
Input.displayName = "Input";

export { Input };
