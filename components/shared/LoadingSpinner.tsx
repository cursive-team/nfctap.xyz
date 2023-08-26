import styled, { keyframes } from "styled-components";

export const LoadingSpinner = () => {
  return (
    <LdsFacebook>
      <LdsFacebookDiv />
      <LdsFacebookDiv />
      <LdsFacebookDiv />
    </LdsFacebook>
  );
};

const ldsFacebookAnimation = keyframes`
  0% {
    top: 4px;
    height: 32px;
  }
  50%, 100% {
    top: 12px;
    height: 16px;
  }
`;

const LdsFacebookDiv = styled.div`
  display: inline-block;
  position: absolute;
  width: 8px;
  background: var(--woodsmoke-100);
  animation: ${ldsFacebookAnimation} 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;

  &:nth-child(1) {
    left: 4px;
    animation-delay: -0.24s;
  }

  &:nth-child(2) {
    left: 16px;
    animation-delay: -0.12s;
  }

  &:nth-child(3) {
    left: 28px;
    animation-delay: 0;
  }
`;

const LdsFacebook = styled.div`
  display: inline-block;
  position: relative;
  width: 40px;
  height: 40px;
`;
