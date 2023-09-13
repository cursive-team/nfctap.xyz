"use client";

import styled from "styled-components";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function ModalHeader() {
  const router = useRouter();

  return (
    <ModalHeaderContainer>
      <div onClick={() => router.push("/home")}>
        <Image src="/buttons/close.svg" width="24" height="24" alt="Close" />
      </div>
    </ModalHeaderContainer>
  );
}

export const ModalBackground = styled.div`
  display: flex;
  padding: 40px 0px 80px 0px;
  min-width: 100vw;
  min-height: 100vh;
  flex-direction: column;
  align-items: center;
  background: rgba(40, 40, 40, 0.8);
`;

export const ModalContainer = styled.div`
  display: flex;
  width: 358px;
  padding: 0px 16px;
  flex-direction: column;
  align-items: center;
  flex: 1 0 0;
`;

export const ModalDiv = styled.div`
  display: flex;
  padding-bottom: 40px;
  flex-direction: column;
  align-items: center;
  flex: 1 0 0;
  align-self: stretch;
  border-radius: 8px;
  background: var(--woodsmoke-950);
`;

export const ModalHeaderContainer = styled.div`
  display: flex;
  padding: 24px 16px;
  justify-content: flex-end;
  align-items: center;
  align-self: stretch;
`;

export const OuterContainer = styled.div`
  display: flex;
  padding: 0px 8px;
`;

export const InnerContainer = styled.div`
  display: flex;
  max-width: 264px;
  flex-direction: column;
  text-align: center;
  align-items: center;
  gap: 24px;
  flex: 1 0 0;
`;
