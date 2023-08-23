import styled from "styled-components";
import Image from "next/image";
import { AppleWalletButton } from "../wallet/AppleWalletButton";
import { GoogleWalletButton } from "../wallet/GoogleWalletButton";

export function ModalHeader() {
  return (
    <ModalHeaderContainer>
      <a href="/home">
        <Image src="/buttons/close.svg" width="24" height="24" alt="Close" />
      </a>
    </ModalHeaderContainer>
  );
}

export const ModalBackground = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  padding: 40px 0px 80px 0px;
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
