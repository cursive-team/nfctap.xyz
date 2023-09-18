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
import { Leaderboard } from "@prisma/client";

export default function HomeScreen() {
  const [sigmojiArr, setSigmojiArr] = useState<Sigmoji[]>();
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>();

  useEffect(() => {
    const loadSigmojiArr = async () => {
      const arr = await loadSigmojis();
      setSigmojiArr(arr);
    };
    loadSigmojiArr();
  }, []);

  useEffect(() => {
    const loadLeaderboard = async () => {
      const response = await fetch("api/leaderboard");
      const data = await response.json();
      setLeaderboard(data);
    };
    loadLeaderboard();
  });

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <MainHeader />

      <Chevron initiallyOpen={true} bottom={false} text={"MY COLLECTION"}>
        {!sigmojiArr ? (
          <LoadingSpinner />
        ) : sigmojiArr.length === 0 ? (
          <PrimaryFontBase style={{ color: "var(--woodsmoke-100)" }}>
            Get tapping to start collecting!
          </PrimaryFontBase>
        ) : (
          <LeaderboardContainer>
            <LeaderboardTitle>
              <FirstColumnContainer>
                <CourierPrimeH4>Sigmoji</CourierPrimeH4>
              </FirstColumnContainer>
              <SecondColumnContainer>
                <CourierPrimeH4>Edition</CourierPrimeH4>
              </SecondColumnContainer>
              <ThirdColumnContainer>
                <CourierPrimeH4>Points</CourierPrimeH4>
              </ThirdColumnContainer>
            </LeaderboardTitle>
            {sigmojiArr.map((sigmoji, index) => (
              <LeaderboardRow
                key={index}
                isLast={index === sigmojiArr.length - 1}
              >
                <FirstColumnContainer>
                  <Image
                    src={`/emoji-photo/${sigmoji.emojiImg}`}
                    width="16"
                    height="16"
                    alt="emoji"
                  />
                </FirstColumnContainer>
                <SecondColumnContainer>
                  <CourierPrimeBase>{sigmoji.PCD.claim.nonce}</CourierPrimeBase>
                </SecondColumnContainer>
                <ThirdColumnContainer>
                  <CourierPrimeBase>1</CourierPrimeBase>
                </ThirdColumnContainer>
              </LeaderboardRow>
            ))}
            <ScoreContainer>
              <FirstColumnContainer>
                <CourierPrimeH4
                  style={{
                    color: "var(--snow-flurry-200)",
                  }}
                >
                  Score
                </CourierPrimeH4>
              </FirstColumnContainer>
              <SecondColumnContainer></SecondColumnContainer>
              <ThirdColumnContainer>
                <CourierPrimeH4
                  style={{
                    color: "var(--snow-flurry-200)",
                  }}
                >
                  {sigmojiArr.length}
                </CourierPrimeH4>
              </ThirdColumnContainer>
            </ScoreContainer>
          </LeaderboardContainer>
        )}
      </Chevron>

      <Chevron initiallyOpen={false} bottom={true} text={"REVEALED SCORES"}>
        {!leaderboard ? (
          <LoadingSpinner />
        ) : leaderboard.length === 0 ? (
          <PrimaryFontBase style={{ color: "var(--woodsmoke-100)" }}>
            Reveal your score with ZK!
          </PrimaryFontBase>
        ) : (
          <LeaderboardContainer>
            <LeaderboardTitle>
              <FirstColumnContainer>
                <CourierPrimeH4>Rank</CourierPrimeH4>
              </FirstColumnContainer>
              <SecondColumnContainer>
                <CourierPrimeH4>Pseudonym</CourierPrimeH4>
              </SecondColumnContainer>
              <ThirdColumnContainer>
                <CourierPrimeH4>Score</CourierPrimeH4>
              </ThirdColumnContainer>
            </LeaderboardTitle>
            {leaderboard.map((row, index) => (
              <LeaderboardRow
                key={index}
                isLast={index === leaderboard.length - 1}
              >
                <FirstColumnContainer>
                  <CourierPrimeBase>{index + 1}</CourierPrimeBase>
                </FirstColumnContainer>
                <SecondColumnContainer>
                  <CourierPrimeBase>{row.pseudonym}</CourierPrimeBase>
                </SecondColumnContainer>
                <ThirdColumnContainer>
                  <CourierPrimeBase>{row.score}</CourierPrimeBase>
                </ThirdColumnContainer>
              </LeaderboardRow>
            ))}
          </LeaderboardContainer>
        )}
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

const LeaderboardRow = styled.div<{ isLast?: boolean }>`
  display: flex;
  padding: 4px 0px;
  align-items: center;
  gap: 24px;
  align-self: stretch;
  border-bottom: ${(props) =>
    props.isLast ? "none" : "1px solid rgba(231, 231, 231, 0.1)"};
`;

const ScoreContainer = styled.div`
  display: flex;
  margin-top: 8px;
  padding: 16px 0px;
  align-items: center;
  gap: 16px;
  align-self: stretch;
  border-top: 1px solid var(--woodsmoke-700);
  background: var(--woodsmoke-950);
`;

const FirstColumnContainer = styled.div`
  display: flex;
  width: 80px;
  align-items: flex-end;
  gap: 8px;
`;

const SecondColumnContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 0 0;
`;

const ThirdColumnContainer = styled.div`
  display: flex;
  width: 72px;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 8px;
`;
