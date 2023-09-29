import React, { ReactNode } from "react";

interface FieldWrapperProps {
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
}

const FieldWrapper = ({ title, description, children, className, ...rest }: FieldWrapperProps) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {title && <p className="text-woodsmoke-100">{title}</p>}
      <>{children}</>
      {description && (
        <p className="text-xs text-left text-woodsmoke-100">{description}</p>
      )}
    </div>
  );
};

FieldWrapper.displayName = "FieldWrapper";

export { FieldWrapper };
