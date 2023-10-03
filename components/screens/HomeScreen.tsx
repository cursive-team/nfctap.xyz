import { MainHeader } from "@/components/shared/Headers";
import Chevron from "../shared/Chevron";
import { useState, useEffect, ReactNode } from "react";
import Footer from "../shared/Footer";
import {
  loadLeaderboardEntries,
  loadSigmojis,
  loadBackupState,
  loadSigmojiWalletBackup,
} from "@/lib/localStorage";
import { Sigmoji } from "@/lib/types";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import Image from "next/image";
import { Leaderboard } from "@prisma/client";
import { useRouter } from "next/navigation";
import { AppleWalletButton } from "../wallet/AppleWalletButton";
import { GoogleWalletButton } from "../wallet/GoogleWalletButton";
import { Button } from "../ui/button";
import { attestationText } from "@/lib/attestationData";
import { cn } from "@/lib/utils";

type LeaderboardRow = {
  pseudonym: string;
  score: number;
  rank: number;
  belongsToUser: boolean;
};

interface LeaderboardProps {
  children?: ReactNode;
  className?: string;
}

const LeaderboardContainer = ({ children }: LeaderboardProps) => {
  return (
    <div className="flex flex-col items-start self-stretch px-2">
      {children}
    </div>
  );
};

const ScoreContainer = ({ children }: LeaderboardProps) => {
  return (
    <div className="flex items-center gap-6 py-4 border-t border-t-woodsmoke-700 bg-woodsmoke-950 mt-2 w-full">
      {children}
    </div>
  );
};

const LeaderboardTable = ({
  children,
  className,
  ...props
}: LeaderboardProps) => {
  return (
    <div
      className={`grid grid-cols-[80px_1fr_72px] items-center self-stretch gap-6 w-full ${className}`}
    >
      {children}
    </div>
  );
};

const LeaderboardRow = ({
  children,
  isFinalEntry,
}: LeaderboardProps & { isFinalEntry: boolean }) => {
  return (
    <div
      className={cn("flex py-1 items-center gap-6 self-stretch w-full", {
        "border-b border-b-woodsmoke-700": !isFinalEntry,
      })}
    >
      {children}
    </div>
  );
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
            <LeaderboardTable className="py-2">
              <span className="courier-font-sm">Sigmoji</span>
              <span className="courier-font-sm">Edition</span>
              <div className="flex gap-2 items-end w-[72px] justify-end">
                <span className="courier-font-sm">Points</span>
              </div>
            </LeaderboardTable>
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
                    <div className="flex items-end gap-2 w-[80px]">
                      <Image
                        src={`/emoji-photo/${sigmoji.emojiImg}`}
                        width="16"
                        height="16"
                        alt="emoji"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="courier-font-base">
                        {sigmoji.PCD.claim.nonce}
                      </span>
                    </div>
                    <div className="flex w-[72px] items-center justify-end gap-2">
                      <span className="courier-font-base">1</span>
                    </div>
                  </LeaderboardRow>
                );
              })}
            <ScoreContainer>
              <div className="flex items-end gap-2 w-[80px]">
                <span className="courier-font-sm text-snow-flurry-200">
                  Total
                </span>
              </div>
              <div className="flex items-center gap-2 flex-1"></div>
              <div className="flex w-[72px] items-center justify-end gap-2">
                <span className="courier-font-sm text-snow-flurry-200">
                  {sigmojiArr.length - eventSigmojiTotal}
                </span>
              </div>
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
              <LeaderboardTable className="py-2">
                <div className="flex items-end gap-2 w-[80px]">
                  <span className="courier-font-sm">Sigmoji</span>
                </div>
                <div className="flex items-center gap-2 flex-1"></div>
                <div className="flex w-[72px] items-center justify-end gap-2">
                  <span className="courier-font-sm">Meaning</span>
                </div>
              </LeaderboardTable>
              {sigmojiArr
                .filter((sigmoji) => attestationText(sigmoji.PCD) !== undefined)
                .map((sigmoji, index) => {
                  return (
                    <LeaderboardRow
                      key={index}
                      isFinalEntry={index === eventSigmojiTotal - 1}
                    >
                      <div className="flex items-end gap-2 w-[80px]">
                        <Image
                          src={`/emoji-photo/${sigmoji.emojiImg}`}
                          width="16"
                          height="16"
                          alt="emoji"
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-1"></div>
                      <div className="flex w-full items-center justify-end gap-2">
                        <span className="courier-font-base">
                          {attestationText(sigmoji.PCD)}
                        </span>
                      </div>
                    </LeaderboardRow>
                  );
                })}
              <ScoreContainer>
                <div className="flex items-end gap-2 w-[80px]">
                  <span className="courier-font-sm text-snow-flurry-200">
                    Total
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-1"></div>
                <div className="flex w-[72px] items-center justify-end gap-2">
                  <span className="courier-font-sm text-snow-flurry-200">
                    {eventSigmojiTotal}
                  </span>
                </div>
              </ScoreContainer>
            </LeaderboardContainer>
          )}
        </Chevron>
      ) : (
        <></>
      )}

      <Chevron initiallyOpen={false} bottom={false} text={"TELEGRAM"}>
        <Button
          className="w-full"
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
                <div className="grid grid-cols-[80px_1fr_72px] items-center w-full gap-6">
                  <div className="flex self-end gap-2">
                    <span className="courier-font-sm">Rank</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="courier-font-sm">Pseudonym</span>
                  </div>
                  <div className="flex w-[72px] items-center justify-end gap-2">
                    <span className="courier-font-sm">Score</span>
                  </div>
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
                      <div className="flex items-end gap-2 w-[80px]">
                        <span className="courier-font-base" style={style}>
                          {row.rank}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <span className="courier-font-base" style={style}>
                          {row.pseudonym}
                        </span>
                      </div>
                      <div className="flex w-[72px] items-center justify-end gap-2">
                        <span className="courier-font-base" style={style}>
                          {row.score}
                        </span>
                      </div>
                    </LeaderboardRow>
                  );
                })}
              </>
            )}

            <div className="flex flex-col mt-10 p-6 items-start self-stretch gap-8 bg-woodsmoke-950 rounded-2xl">
              <div className="flex items-center gap-[25px] self-stretch">
                <div className="flex h-[18px] items-center w-full gap-2">
                  <span className="courier-font-sm !text-snow-flurry-200">
                    Score
                  </span>
                </div>
                <div className="flex h-[18px] justify-end items-center gap-2 w-full">
                  <Image
                    src="/buttons/eye-close-fill.svg"
                    width="16"
                    height="16"
                    alt="eye"
                  />
                  <span className="courier-font-sm !text-snow-flurry-200">
                    {sigmojiArr.length}
                  </span>
                </div>
              </div>
              <Button
                className="w-full"
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
            </div>
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

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}