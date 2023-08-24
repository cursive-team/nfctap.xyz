import styled from "styled-components";
import Image from "next/image";

const FooterContainer = styled.div`
  display: flex;
  padding: 32px 0px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--woodsmoke-700);
  background: var(--woodsmoke-950);
`;

const LogoTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const Footer = () => (
  <FooterContainer>
    <LogoTextContainer>
      <Image src="/pse-logo.svg" width="96" height="96" alt="PSE Logo" />
      <p style={{ color: "var(--snow-flurry-200)" }}>
        <a href="https://pse.dev" target="_blank">
          pse.dev
        </a>
      </p>
    </LogoTextContainer>
  </FooterContainer>
);

export default Footer;
