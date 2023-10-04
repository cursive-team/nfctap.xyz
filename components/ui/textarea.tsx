import React from "react";
import { FieldWrapper, FieldWrapperProps } from "./field";
import { cn } from "@/lib/utils";

export interface TextAreaProps
  extends React.ButtonHTMLAttributes<Partial<HTMLTextAreaElement>>,
    Pick<FieldWrapperProps, "error"> {
  label?: string;
}

const TextArea = React.forwardRef<HTMLDivElement, TextAreaProps>(
  ({ className, label, error, children, ...props }, ref) => {
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
          <textarea
            className={cn(
              "flex min-h-[126px] bg-transparent w-full p-2 items-center flex-col text-base font-helvetica font-normal text-snow-flurry-200 border rounded without-ring justify-center",
              {
                "border-snow-flurry-200": !error,
                "border-red-500": error,
              }
            )}
            {...props}
          />
        </div>
      </FieldWrapper>
    );
  }
);

TextArea.displayName = "TextArea";

export { TextArea };
