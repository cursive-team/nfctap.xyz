import React, {  useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";


interface ChevronProps {
  text: string;
  initiallyOpen: boolean;
  bottom: boolean;
  children: React.ReactNode;
  noToggle?: boolean;
}

export default function Chevron({
  text,
  initiallyOpen,
  bottom,
  children,
  noToggle,
}: ChevronProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <>
      <div className={
        cn('flex p-6 flex-col items-center self-stretch gap-4', {
          'none': bottom,
          'border-b border-b-woodsmoke-700': !bottom,
          'pb-[64px]': bottom,
          'pb-[24px]': !bottom,
        })
      }>
        <div 
          className="flex w-full items-center self-stretch gap-4"
          onClick={() => {
            if (noToggle) return;
            setIsOpen(!isOpen);
          }}
        >
          <div className="w-full">
            <span className="w-full font-helvetica text-lg font-bold leading-normal text-woodsmoke-100">
              {text}
            </span>
          </div>
          {noToggle ? (
            <></>
          ) : (
            <Image
              src="/buttons/chevron-down.svg" 
              width="24"
              height="24"
              alt="Chevron"
              className={cn('duration-150', {
                'rotate-180': isOpen,
              })}
              priority
            />
          )}
        </div>
        <div 
          className={cn('flex duration-200 w-full items-center self-stretch gap-4 flex-col overflow-hidden', {
           'hidden h-0': !isOpen,
         })}
        >
          {children}
        </div>
      </div>
    </>
  );
}