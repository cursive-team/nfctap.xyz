import { MainHeader } from "@/components/shared/Headers";
import Chevron from "../shared/Chevron";
import { useState, useEffect } from "react";
import Footer from "../shared/Footer";
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
import { useRouter } from "next/navigation";
import { AppleWalletButton } from "../wallet/AppleWalletButton";
import { GoogleWalletButton } from "../wallet/GoogleWalletButton";
import { Button } from "../ui/button";
import { attestationText } from "@/lib/attestationData";

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
  const [eventSigmojiTotal, setEventSigmojiTotal] = useState(0);

  useEffect(() => {
    const loadState = async () => {
      const arr = await loadSigmojis();
      setSigmojiArr(arr);
      setEventSigmojiTotal(
        arr.filter((sigmoji) => attestationText(sigmoji.PCD) !== undefined)
          .length
      );

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

      <Chevron initiallyOpen={true} bottom={false} text={"SIGMOJIDEX"}>
        {!sigmojiArr ? (
          <LoadingSpinner />
        ) : sigmojiArr.length - eventSigmojiTotal === 0 ? (
          <span className="primary-font-base">
            Get tapping to start collecting!
          </span>
        ) : (
          <LeaderboardContainer>
            <LeaderboardTitle>
              <FirstColumnContainer>
                <span className="courier-font-sm">Sigmoji</span>
              </FirstColumnContainer>
              <SecondColumnContainer>
                <span className="courier-font-sm">Edition</span>
              </SecondColumnContainer>
              <div className="flex gap-2 items-end w-[72px] justify-end">
                <span className="courier-font-sm">Points</span>
              </div>
            </LeaderboardTitle>
            {sigmojiArr
              .filter((sigmoji) => attestationText(sigmoji.PCD) === undefined)
              .map((sigmoji, index) => {
                return (
                  <LeaderboardRow
                    key={index}
                    isFinalEntry={
                      index === sigmojiArr.length - eventSigmojiTotal - 1
                    }
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
                      <span className="courier-font-base">
                        {sigmoji.PCD.claim.nonce}
                      </span>
                    </SecondColumnContainer>
                    <ThirdColumnContainer>
                      <span className="courier-font-base">1</span>
                    </ThirdColumnContainer>
                  </LeaderboardRow>
                );
              })}
            <ScoreContainer>
              <FirstColumnContainer>
                <span  className="courier-font-sm text-snow-flurry-200">
                  Total
                </span>
              </FirstColumnContainer>
              <SecondColumnContainer></SecondColumnContainer>
              <ThirdColumnContainer>
                <span className="courier-font-sm text-snow-flurry-200"                >
                  {sigmojiArr.length - eventSigmojiTotal}
                </span>
              </ThirdColumnContainer>
            </ScoreContainer>
          </LeaderboardContainer>
        )}
      </Chevron>

      {eventSigmojiTotal > 0 ? (
        <Chevron initiallyOpen={true} bottom={false} text={"ATTESTATIONS"}>
          {!sigmojiArr ? (
            <LoadingSpinner />
          ) : (
            <LeaderboardContainer>
              <LeaderboardTitle>
                <FirstColumnContainer>
                  <span className="courier-font-sm">Sigmoji</span>
                </FirstColumnContainer>
                <SecondColumnContainer></SecondColumnContainer>
                <ThirdColumnContainer>
                  <span className="courier-font-sm">Meaning</span>
                </ThirdColumnContainer>
              </LeaderboardTitle>
              {sigmojiArr
                .filter((sigmoji) => attestationText(sigmoji.PCD) !== undefined)
                .map((sigmoji, index) => {
                  return (
                    <LeaderboardRow
                      key={index}
                      isFinalEntry={index === eventSigmojiTotal - 1}
                    >
                      <FirstColumnContainer>
                        <Image
                          src={`/emoji-photo/${sigmoji.emojiImg}`}
                          width="16"
                          height="16"
                          alt="emoji"
                        />
                      </FirstColumnContainer>
                      <SecondColumnContainer></SecondColumnContainer>
                      <ThirdColumnContainer style={{ width: "100%" }}>
                        <span className="courier-font-base">
                          {attestationText(sigmoji.PCD)}
                        </span>
                      </ThirdColumnContainer>
                    </LeaderboardRow>
                  );
                })}
              <ScoreContainer>
                <FirstColumnContainer>
                  <span className="courier-font-sm text-snow-flurry-200">
                    Total
                  </span>
                </FirstColumnContainer>
                <SecondColumnContainer></SecondColumnContainer>
                <ThirdColumnContainer>
                  <span className="courier-font-sm text-snow-flurry-200">
                    {eventSigmojiTotal}
                  </span>
                </ThirdColumnContainer>
              </ScoreContainer>
            </LeaderboardContainer>
          )}
        </Chevron>
      ) : (
        <></>
      )}

      <Chevron initiallyOpen={false} bottom={false} text={"TELEGRAM"}>
        <Button
          style={{ width: "100%" }}
          onClick={() => router.push("/chat")}
          icon="💬"
        >
          COLLECTOR CHAT
        </Button>
        <Button
          className="w-full"
          onClick={() => router.push("/anon")}
          icon="🕵️‍♂️"
        >
          ANON COLLECTOR CHAT
        </Button>
        <Button
          className="w-full"
          onClick={() => router.push("/cardholder")}
          icon="💳"
        >
          CARDHOLDER CHAT
        </Button>
      </Chevron>

      <Chevron initiallyOpen={false} bottom={false} text={"LEADERBOARD"}>
        {!leaderboard || !sigmojiArr ? (
          <LoadingSpinner />
        ) : (
          <LeaderboardContainer>
            {leaderboard.length === 0 ? (
              <span className="primary-font-base">
                Reveal your score with ZK!
              </span>
            ) : (
              <>
                <div className="grid grid-cols-[80px_1fr_72px] items-center w-full">
                  <div className="flex self-end gap-2">
                    <span className="courier-font-sm">Rank</span>
                  </div>
                  <SecondColumnContainer>
                    <span className="courier-font-sm">Pseudonym</span>
                  </SecondColumnContainer>
                  <ThirdColumnContainer>
                    <span className="courier-font-sm">Score</span>
                  </ThirdColumnContainer>
                </div>
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
                        <span className="courier-font-base" style={style}>
                          {row.rank}
                        </span>
                      </FirstColumnContainer>
                      <SecondColumnContainer>
                        <span className="courier-font-base" style={style}>
                          {row.pseudonym}
                        </span>
                      </SecondColumnContainer>
                      <ThirdColumnContainer>
                        <span className="courier-font-base" style={style}>
                          {row.score}
                        </span>
                      </ThirdColumnContainer>
                    </LeaderboardRow>
                  );
                })}
              </>
            )}

            <RevealContainer>
              <RevealTextContainer>
                <RevealTitleContainer>
                  <span className="courier-font-sm text-snow-flurry-200">
                    Score
                  </span>
                </RevealTitleContainer>
                <RevealScoreContainer>
                  <Image
                    src="/buttons/eye-close-fill.svg"
                    width="16"
                    height="16"
                    alt="eye"
                  />
                  <span className="courier-font-sm text-snow-flurry-200">
                    {sigmojiArr.length}
                  </span>
                </RevealScoreContainer>
              </RevealTextContainer>
              <Button
                style={{ width: "100%" }}
                onClick={() => router.push("/prove")}
              >
                <div className="flex gap-1">
                  <Image
                    src="/buttons/eye-2-line.svg"
                    width="16"
                    height="16"
                    alt="eye"
                  />
                  <span>REVEAL</span>
                </div>
              </Button>
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
            <span className="primary-font-base">
              {`Update your existing backup!`}
            </span>
          ) : (
            <span className="primary-font-base">
              {`Currently, your sigmojis live in your browser, where they will be 
            cleared with time. To keep your sigmojis forever, back them up to 
            a more permanent store! `}
            </span>
          )}
          <div className="flex flex-col justify-center items-center gap-6 inline-flex w-full">
            <AppleWalletButton />
            <GoogleWalletButton />
            <Button
              variant="secondary"
              className="w-[264px]"
              onClick={async () => {
                const serializedSigmojis = await loadSigmojiWalletBackup();
                navigator.clipboard.writeText(serializedSigmojis);
              }}
            >
              Copy data store
            </Button>
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
