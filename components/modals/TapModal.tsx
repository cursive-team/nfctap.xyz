"use client";

import {
  ModalBackground,
  ModalContainer,
  ModalDiv,
  ModalHeader,
} from "../shared/Modal";
import { PrimaryFontBase, PrimaryFontH3 } from "../core";
import styled from "styled-components";

export default function CollectedModal() {
  return (
    <ModalBackground>
      <ModalContainer>
        <ModalDiv>
          <ModalHeader />
          <OuterContainer>
            <InnerContainer>
              <PrimaryFontH3 style={{ color: "var(--woodsmoke-100)" }}>
                Tap the NFC card on your phone.
              </PrimaryFontH3>
              <PrimaryFontBase style={{ color: "var(--woodsmoke-100)" }}>
                Depending on your phone, it could take a few seconds to read. If
                nothing happens, check out the{" "}
                <a
                  href="https://pse-team.notion.site/Card-tapping-instructions-ac5cae2f72e34155ba67d8a251b2857c?pvs=4"
                  target="_blank"
                  style={{ textDecoration: "underline" }}
                >
                  troubleshooting guide
                </a>
                .
              </PrimaryFontBase>
            </InnerContainer>
          </OuterContainer>
          <img
            src="/phone-tap.gif"
            style={{ marginTop: "40px", marginBottom: "40px" }}
          />
        </ModalDiv>
      </ModalContainer>
    </ModalBackground>
  );
}

const OuterContainer = styled.div`
  display: flex;
  padding: 0px 8px;
`;

const InnerContainer = styled.div`
  display: flex;
  max-width: 264px;
  flex-direction: column;
  text-align: center;
  align-items: center;
  gap: 24px;
  flex: 1 0 0;
`;
