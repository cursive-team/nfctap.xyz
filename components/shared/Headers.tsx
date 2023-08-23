import Image from "next/image";
import styled from "styled-components";
import { CollectButton } from "./Buttons";
import { PrimaryFontBase1 } from "../core";

export const MainHeader = () => {
  return (
    <MainContainer>
      <MainInnerDiv>
        <Image src="/logo.svg" width="40" height="40" alt="Logo" />
        <CollectButton>
          <PrimaryFontBase1>COLLECT</PrimaryFontBase1>
        </CollectButton>
      </MainInnerDiv>
    </MainContainer>
  );
};

const MainContainer = styled.div`
  display: flex;
  width: 100%;
  height: 120px;
  padding: 32px 24px 8px 24px;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--woodsmoke-800);
  background: var(--woodsmoke-950);
`;

const MainInnerDiv = styled.div`
  display: flex;
  height: 42px;
  justify-content: space-between;
  align-items: center;
  flex: 1 0 0;
`;

export const SecondaryHeader = () => {
  return (
    <SecondaryContainer>
      <SecondaryInnerDiv>
        <Image src="/logo.svg" width="40" height="40" alt="Logo" />
      </SecondaryInnerDiv>
    </SecondaryContainer>
  );
};

const SecondaryContainer = styled.div`
  display: flex;
  width: 100%;
  height: 120px;
  padding: 32px 24px 8px 24px;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  align-self: stretch;
`;

const SecondaryInnerDiv = styled.div`
  display: flex;
  height: 42px;
  justify-content: center;
  align-items: center;
  flex: 1 0 0;
`;
