import React, { ReactNode } from "react";

export interface FieldWrapperProps {
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
  error?: string;
}

const FieldWrapper = ({
  title,
  description,
  children,
  className,
  error,
  ...rest
}: FieldWrapperProps) => {
  return (
    <div className={`flex flex-col gap-2 relative ${className}`}>
      {title && <p className="text-woodsmoke-100">{title}</p>}
      <>{children}</>
      {description && (
        <p className="text-xs text-left text-woodsmoke-100">{description}</p>
      )}
      {error && (
        <span className="absolute -bottom-5 text-xs text-red-500 text-left">{error}</span>
      )}
    </div>
  );
};

FieldWrapper.displayName = "FieldWrapper";

export { FieldWrapper };
