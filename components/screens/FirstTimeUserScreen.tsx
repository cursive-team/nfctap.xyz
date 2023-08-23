import React from "react";
import { SecondaryHeader } from "../shared/Headers";
import {
  PrimaryFontH3,
  PrimaryFontBase1,
  PrimaryFontSmall,
  PrimaryFontSmall1,
} from "../core";
import { PrimaryLargeButton, LinkLargeButton } from "../shared/Buttons";
import { styled } from "styled-components";

export enum FirstTimeUserResponse {
  NONE = "NONE",
  YES = "YES",
  RETRIEVE = "RETRIEVE",
}

const FirstTimeUserScreen = ({
  setUserResponse,
}: {
  setUserResponse: (response: FirstTimeUserResponse) => void;
}) => {
  const handleYesClick = () => {
    setUserResponse(FirstTimeUserResponse.YES);
  };

  const handleNoClick = () => {
    setUserResponse(FirstTimeUserResponse.RETRIEVE);
  };

  return (
    <div>
      <SecondaryHeader />
      <div className="px-4">
        <BottomSection>
          <div className="px-2 justify-center items-start inline-flex">
            <ContentMiddle>
              <PrimaryFontH3 style={{ color: "white" }}>
                First time user?
              </PrimaryFontH3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "24px",
                }}
              >
                <PrimaryLargeButton onClick={handleYesClick}>
                  <PrimaryFontBase1>YES</PrimaryFontBase1>
                </PrimaryLargeButton>
                <LinkLargeButton onClick={handleNoClick}>
                  <PrimaryFontBase1 style={{ color: "white" }}>
                    NO, RETRIEVE MY COLLECTION
                  </PrimaryFontBase1>
                </LinkLargeButton>
              </div>
              <TextContainer>
                <PrimaryFontSmall style={{ color: "#888" }}>
                  You may have cleared your browser cache, in which case you
                  should retrieve an old collection. Your permanent storage is
                  private and separate from this app.
                </PrimaryFontSmall>
                <PrimaryFontSmall1 style={{ color: "#C3FF97" }}>
                  <a href="http://nfctap.xyz">nfctap.xyz</a>
                </PrimaryFontSmall1>
              </TextContainer>
            </ContentMiddle>
          </div>
        </BottomSection>
      </div>
    </div>
  );
};

export default FirstTimeUserScreen;

const BottomSection = styled.div`
  display: flex;
  padding: 40px 0px;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
`;

const ContentMiddle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  width: 264px;
`;

const TextContainer = styled.div`
  display: flex;
  padding: 16px 0px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  align-self: stretch;
  text-align: center;
`;
