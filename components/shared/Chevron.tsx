import React from "react";
import styled from "styled-components";
import { PrimaryFontH4 } from "../core";
import Image from "next/image";

interface ChevronProps {
  text: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export default function Chevron({ text, isOpen, setIsOpen }: ChevronProps) {
  return (
    <ChevronContainer onClick={() => setIsOpen(!isOpen)}>
      <div style={{ width: "100%" }}>
        <PrimaryFontH4 style={{ color: "var(--woodsmoke-100)" }}>
          {text}
        </PrimaryFontH4>
      </div>

      {isOpen ? (
        <Image
          src="/buttons/chevron-up.svg"
          width="24"
          height="24"
          alt="Chevron"
          priority
        />
      ) : (
        <Image
          src="/buttons/chevron-down.svg"
          width="24"
          height="24"
          alt="Chevron"
          priority
        />
      )}
    </ChevronContainer>
  );
}

const ChevronContainer = styled.div`
  display: flex;
  padding: 24px;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
  border-bottom: 1px solid var(--woodsmoke-700, #4f4f4f);
`;
