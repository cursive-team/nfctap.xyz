import { MainHeader } from "@/components/shared/Headers";
import Chevron from "../shared/Chevron";
import { useState, useEffect, CSSProperties } from "react";
import Footer from "../shared/Footer";
import {
  PrimaryFontBase,
  CourierPrimeH4,
  CourierPrimeBase,
  PrimaryFontBase1,
  PrimaryFontSmall,
} from "../core";
import {
  loadLeaderboardEntries,
  loadSigmojis,
  loadBackupState,
  loadSigmojiWalletBackup,
} from "@/lib/localStorage";
import { Sigmoji } from "@/lib/types";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import styled from "styled-components";
import Image from "next/image";
import { Leaderboard } from "@prisma/client";
import { PrimaryLargeButton, SecondaryLargeButton } from "../shared/Buttons";
import { useRouter } from "next/navigation";
import { AppleWalletButton } from "../wallet/AppleWalletButton";
import { GoogleWalletButton } from "../wallet/GoogleWalletButton";

type LeaderboardRow = {
  pseudonym: string;
  score: number;
  rank: number;
  belongsToUser: boolean;
};

export default function HomeScreen() {
  const router = useRouter();

  const [sigmojiArr, setSigmojiArr] = useState<Sigmoji[]>();
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>();
  const [hasWalletBackup, setHasWalletBackup] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      const arr = await loadSigmojis();
      setSigmojiArr(arr);

      // pull backup state
      const backup = await loadBackupState();
      if (
        backup !== undefined &&
        (backup.type === "apple" || backup.type === "google")
      ) {
        setHasWalletBackup(true);
      }
    };

    loadState();
  }, []);

  useEffect(() => {
    const loadLeaderboard = async () => {
      const response = await fetch("api/leaderboard");
      const leaderboardEntries = (await response.json()) as Leaderboard[];
      const userLeaderboardEntries = loadLeaderboardEntries();

      let rank = 0;
      let prevScore: Number | undefined;
      let skip = 1;
      const leaderboardRows = leaderboardEntries.map((entry, index) => {
        if (index === 0 || entry.score !== prevScore) {
          prevScore = entry.score;
          rank += skip;
          skip = 1;
        } else {
          skip++;
        }

        const belongsToUser = userLeaderboardEntries.includes(
          JSON.stringify({
            pseudonym: entry.pseudonym,
            score: entry.score,
          })
        );

        return {
          pseudonym: entry.pseudonym,
          score: entry.score,
          rank: rank,
          belongsToUser,
        };
      });
      setLeaderboard(leaderboardRows);
    };
    loadLeaderboard();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
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
                isFinalEntry={index === sigmojiArr.length - 1}
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

      <Chevron initiallyOpen={false} bottom={false} text={"CHAT"}>
        <PrimaryLargeButton
          style={{ width: "100%" }}
          onClick={() => router.push("/chat")}
        >
          <PrimaryFontBase1>💬</PrimaryFontBase1>
          <PrimaryFontBase1>COLLECTOR CHAT</PrimaryFontBase1>
        </PrimaryLargeButton>
        <PrimaryLargeButton
          style={{ width: "100%" }}
          onClick={() => router.push("/anon")}
        >
          <PrimaryFontBase1>🕵️‍♂️</PrimaryFontBase1>
          <PrimaryFontBase1>ANON COLLECTOR CHAT</PrimaryFontBase1>
        </PrimaryLargeButton>
        <PrimaryLargeButton
          style={{ width: "100%" }}
          onClick={() => router.push("/cardholder")}
        >
          <PrimaryFontBase1>💳</PrimaryFontBase1>
          <PrimaryFontBase1>CARDHOLDER CHAT</PrimaryFontBase1>
        </PrimaryLargeButton>
      </Chevron>

      <Chevron initiallyOpen={false} bottom={false} text={"REVEALED SCORES"}>
        {!leaderboard || !sigmojiArr ? (
          <LoadingSpinner />
        ) : (
          <LeaderboardContainer>
            {leaderboard.length === 0 ? (
              <PrimaryFontBase style={{ color: "var(--woodsmoke-100)" }}>
                Reveal your score with ZK!
              </PrimaryFontBase>
            ) : (
              <>
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
                {leaderboard.map((row, index) => {
                  const style = row.belongsToUser
                    ? {
                        color: "var(--snow-flurry-200)",
                      }
                    : undefined;
                  return (
                    <LeaderboardRow
                      key={index}
                      isFinalEntry={index === leaderboard.length - 1}
                    >
                      <FirstColumnContainer>
                        <CourierPrimeBase style={style}>
                          {row.rank}
                        </CourierPrimeBase>
                      </FirstColumnContainer>
                      <SecondColumnContainer>
                        <CourierPrimeBase style={style}>
                          {row.pseudonym}
                        </CourierPrimeBase>
                      </SecondColumnContainer>
                      <ThirdColumnContainer>
                        <CourierPrimeBase style={style}>
                          {row.score}
                        </CourierPrimeBase>
                      </ThirdColumnContainer>
                    </LeaderboardRow>
                  );
                })}
              </>
            )}

            <RevealContainer>
              <RevealTextContainer>
                <RevealTitleContainer>
                  <CourierPrimeH4
                    style={{
                      color: "var(--snow-flurry-200)",
                    }}
                  >
                    Score
                  </CourierPrimeH4>
                </RevealTitleContainer>
                <RevealScoreContainer>
                  <Image
                    src="/buttons/eye-close-fill.svg"
                    width="16"
                    height="16"
                    alt="eye"
                  />
                  <CourierPrimeH4
                    style={{
                      color: "var(--snow-flurry-200)",
                    }}
                  >
                    {sigmojiArr.length}
                  </CourierPrimeH4>
                </RevealScoreContainer>
              </RevealTextContainer>
              <PrimaryLargeButton
                style={{ width: "100%" }}
                onClick={() => router.push("/prove")}
              >
                <Image
                  src="/buttons/eye-2-line.svg"
                  width="16"
                  height="16"
                  alt="eye"
                />
                <PrimaryFontBase1>REVEAL</PrimaryFontBase1>
              </PrimaryLargeButton>
            </RevealContainer>
          </LeaderboardContainer>
        )}
      </Chevron>

      {!sigmojiArr || sigmojiArr.length === 0 ? (
        <></>
      ) : (
        <Chevron
          initiallyOpen={true}
          bottom={true}
          text={"BACKUP SIGMOJIS"}
          noToggle={true}
        >
          {hasWalletBackup ? (
            <PrimaryFontBase style={{ color: "var(--woodsmoke-100)" }}>
              {`Update your existing backup!`}
            </PrimaryFontBase>
          ) : (
            <PrimaryFontBase style={{ color: "var(--woodsmoke-100)" }}>
              {`Currently, your sigmojis live in your browser, where they will be 
            cleared with time. To keep your sigmojis forever, back them up to 
            a more permanent store! `}
            </PrimaryFontBase>
          )}
          <div className="flex flex-col justify-center items-center gap-6 inline-flex w-full">
            <AppleWalletButton />
            <GoogleWalletButton />
            {/* <PrimaryFontSmall
            style={{
              textAlign: "center",
              color: "#888",
            }}
          >
            Alternatively you can copy/paste the data directly to the encrypted
            messaging app or password manager of your choice.
          </PrimaryFontSmall> */}
            <SecondaryLargeButton
              onClick={async () => {
                const serializedSigmojis = await loadSigmojiWalletBackup();
                navigator.clipboard.writeText(serializedSigmojis);
              }}
            >
              <PrimaryFontBase1 style={{ color: "var(--woodsmoke-100)" }}>
                Copy data store
              </PrimaryFontBase1>
            </SecondaryLargeButton>
          </div>
        </Chevron>
      )}

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

const LeaderboardRow = styled.div<{ isFinalEntry?: boolean }>`
  display: flex;
  padding: 4px 0px;
  align-items: center;
  gap: 24px;
  align-self: stretch;
  border-bottom: ${(props) =>
    props.isFinalEntry ? "none" : "1px solid rgba(231, 231, 231, 0.1)"};
`;

const ScoreContainer = styled.div`
  display: flex;
  margin-top: 8px;
  padding: 16px 0px;
  align-items: center;
  gap: 24px;
  align-self: stretch;
  border-top: 1px solid var(--woodsmoke-700);
  background: var(--woodsmoke-950);
`;

const RevealContainer = styled.div`
  display: flex;
  margin-top: 40px;
  padding: 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  align-self: stretch;
  border-radius: 8px;
  background: var(--woodsmoke-900);
`;

const RevealTextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
  align-self: stretch;
`;

const RevealTitleContainer = styled.div`
  display: flex;
  height: 18px;
  align-items: center;
  gap: 8px;
  flex: 1 0 0;
`;

const RevealScoreContainer = styled.div`
  display: flex;
  height: 18px;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  flex: 1 0 0;
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
