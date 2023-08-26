import { MainHeader } from "@/components/shared/Headers";
import Chevron from "../shared/Chevron";
import { useState, useEffect } from "react";
import Footer from "../shared/Footer";
import { PrimaryFontBase, CourierPrimeH4, CourierPrimeBase } from "../core";
import { loadSigmojis } from "@/lib/localStorage";
import { Sigmoji } from "@/lib/types";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import styled from "styled-components";
import Image from "next/image";

export default function HomeScreen() {
  const [sigmojiArr, setSigmojiArr] = useState<Sigmoji[] | null>(null);

  useEffect(() => {
    const loadSigmojiArr = async () => {
      const arr = await loadSigmojis();
      setSigmojiArr(arr);
    };
    loadSigmojiArr();
  }, []);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <MainHeader />
      <Chevron initiallyOpen={true} bottom={false} text={"MY COLLECTION"}>
        {sigmojiArr === null ? (
          <LoadingSpinner />
        ) : sigmojiArr.length === 0 ? (
          <PrimaryFontBase style={{ color: "var(--woodsmoke-100)" }}>
            Get tapping to start collecting!
          </PrimaryFontBase>
        ) : (
          <LeaderboardContainer>
            <LeaderboardTitle>
              <CourierPrimeH4>Sigmoji</CourierPrimeH4>
              <div style={{ width: "100%" }}>
                <CourierPrimeH4>Edition</CourierPrimeH4>
              </div>
              <CourierPrimeH4>Points</CourierPrimeH4>
            </LeaderboardTitle>
            {sigmojiArr.map((sigmoji, index) => (
              <LeaderboardRow key={index}>
                <EmojiHolder>
                  <Image
                    src={`/emoji-photo/${sigmoji.emojiImg}`}
                    width="16"
                    height="16"
                    alt="emoji"
                  />
                </EmojiHolder>
                <EditionHolder>
                  <CourierPrimeBase>{sigmoji.PCD.claim.nonce}</CourierPrimeBase>
                </EditionHolder>
                <PointsHolder>
                  <CourierPrimeBase>0</CourierPrimeBase>
                </PointsHolder>
              </LeaderboardRow>
            ))}
          </LeaderboardContainer>
        )}
      </Chevron>
      <Chevron initiallyOpen={false} bottom={true} text={"REVEALED SCORES"}>
        <></>
      </Chevron>
      <div style={{ marginTop: "auto" }}>
        <Footer />
      </div>
    </div>
  );
}

const LeaderboardContainer = styled.div`
  display: flex;
  padding: 0px 8px 0px 8px;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
`;

const LeaderboardTitle = styled.div`
  display: flex;
  padding: 8px 0px;
  align-items: center;
  gap: 24px;
  align-self: stretch;
`;

const LeaderboardRow = styled.div`
  display: flex;
  padding: 4px 0px;
  align-items: center;
  gap: 24px;
  align-self: stretch;
  &:not(:last-child) {
    border-bottom: 1px solid rgba(231, 231, 231, 0.1);
  }
`;

const EmojiHolder = styled.div`
  display: flex;
  width: 80px;
  align-items: flex-end;
  gap: 8px;
`;

const EditionHolder = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 0 0;
`;

const PointsHolder = styled.div`
  display: flex;
  width: 72px;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 8px;
`;
