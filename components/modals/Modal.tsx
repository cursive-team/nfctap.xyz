"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";

interface ModalProps {
  title?: ReactNode
  subtitle?: ReactNode
  description?: ReactNode
  children: ReactNode,
  footer?: ReactNode
}

const ModalHeader = () => {
  const router = useRouter();

  return (
    <div className="flex py-6 px-4 self-stretch items-center">
      <div className="ml-auto" onClick={() => router.push("/")}>
        <Image src="/buttons/close.svg" width="24" height="24" alt="Close" />
      </div>
    </div>
  );
};

const OuterContainer = ({ children }: Pick<ModalProps, "children">) => {
  return <div className="flex px-2">{children}</div>;
};

const InnerContainer = ({ children }: Pick<ModalProps, "children">) => {
  return <div className="flex flex-col text-center gap-6 items-center px-5">
    {children}
  </div>
}

export default function Modal({ children, footer, title, subtitle, description }: ModalProps) {
  return (
    <div className="flex items-center pt-[40px] pb-[80px] bg-[#282828]/80 min-w-[100vw] min-h-screen">
      <div className="flex items-center flex-col px-4 w-full">
        <div className="pb-10 flex flex-col items-center self-stretch bg-woodsmoke-950 rounded-xl">
          <ModalHeader />
          <OuterContainer>
            <InnerContainer>
              {(title || description) && <div className="flex flex-col gap-4 text-center self-stretch p-2">
                {title && <h1 className="text-4xl font-bold text-woodsmoke-100 leading-none">{title}</h1>}
                {subtitle && <h3 className="text-[23px] font-bold text-woodsmoke-100 leading-tight">{subtitle}</h3>}
                {description && <span className="flex flex-col gap-4 text-base font-normal font-helvetica leading-[140%] text-woodsmoke-100">{description}</span>}
              </div>}
              {children}
            </InnerContainer>
          </OuterContainer>
          {footer}
        </div>
      </div>
    </div>
  );
}
