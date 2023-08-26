import React, { useState } from "react";
import styled from "styled-components";
import { PrimaryFontH4 } from "../core";
import Image from "next/image";

export default function Chevron({
  text,
  initiallyOpen,
  bottom,
  children,
}: {
  text: string;
  initiallyOpen: boolean;
  bottom: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <>
      {isOpen ? (
        <ChevronOpenContainer $noBorder={bottom}>
          <ChevronTextArrowContainer onClick={() => setIsOpen(!isOpen)}>
            <div style={{ width: "100%" }}>
              <PrimaryFontH4 style={{ color: "var(--woodsmoke-100)" }}>
                {text}
              </PrimaryFontH4>
            </div>
            <Image
              src="/buttons/chevron-up.svg"
              width="24"
              height="24"
              alt="Chevron"
              priority
            />
          </ChevronTextArrowContainer>
          {children}
        </ChevronOpenContainer>
      ) : (
        <ChevronClosedContainer>
          <ChevronTextArrowContainer onClick={() => setIsOpen(!isOpen)}>
            <div style={{ width: "100%" }}>
              <PrimaryFontH4 style={{ color: "var(--woodsmoke-100)" }}>
                {text}
              </PrimaryFontH4>
            </div>
            <Image
              src="/buttons/chevron-down.svg"
              width="24"
              height="24"
              alt="Chevron"
              priority
            />
          </ChevronTextArrowContainer>
        </ChevronClosedContainer>
      )}
    </>
  );
}

const ChevronTextArrowContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: stretch;
`;

const ChevronClosedContainer = styled.div`
  padding: 24px;
  border-bottom: 1px solid var(--woodsmoke-700, #4f4f4f);
`;

const ChevronOpenContainer = styled.div<{ $noBorder?: boolean }>`
  display: flex;
  padding: 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;
  border-bottom: ${(props) =>
    props.$noBorder ? "none" : "1px solid var(--woodsmoke-700, #4f4f4f)"};
`;
