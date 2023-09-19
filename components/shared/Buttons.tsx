import styled from "styled-components";

export const CollectButton = styled.div`
  display: flex;
  height: 42px;
  padding: 8px 16px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  border-radius: 6px;
  background: var(--snow-flurry-200);
`;

export const PrimaryLargeButton = styled.button`
  display: flex;
  width: 264px;
  height: 42px;
  padding: 8px 16px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  border-radius: 6px;
  background: var(--snow-flurry-200);
  transition: transform 0.2s ease; // smooth transform transition

  &:active {
    transform: scale(0.95); // scale down a bit when clicked
  }
`;

export const SecondaryLargeButton = styled.div`
  display: flex;
  width: 264px;
  height: 42px;
  padding: 8px 16px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  border-radius: 6px;
  border: 2px solid var(--woodsmoke-100);
`;

export const LinkLargeButton = styled.div`
  display: inline-flex;
  padding: 8px 0px;
  align-items: flex-start;
  gap: 8px;
  border-bottom: 1px solid var(--snow-flurry-200);
`;
