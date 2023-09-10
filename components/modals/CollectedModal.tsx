"use client";

import { AppleWalletButton } from "../wallet/AppleWalletButton";
import { GoogleWalletButton } from "../wallet/GoogleWalletButton";
import Modal from "./Modal";
import {
  PrimaryFontBase1,
  PrimaryFontH3,
  PrimaryFontH4,
  PrimaryFontSmall,
} from "../core";
import Image from "next/image";
import { SecondaryLargeButton } from "../shared/Buttons";
import {
  HaLoNoncePCDArgs,
  HaLoNoncePCD,
  HaLoNoncePCDPackage,
} from "@pcd/halo-nonce-pcd";
import { useEffect, useState } from "react";
import { cardPubKeys } from "@/lib/cardPubKeys";
import { Sigmoji } from "@/lib/types";
import { loadBackupState, loadSigmojis, saveSigmoji } from "@/lib/localStorage";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../shared/LoadingSpinner";

export default function CollectedModal({ args }: { args: HaLoNoncePCDArgs }) {
  const router = useRouter();

  const [pcd, setPCD] = useState<HaLoNoncePCD | undefined>(undefined);
  const [imageLink, setImageLink] = useState<string | undefined>(undefined);
  const [alreadyCollected, setAlreadyCollected] = useState(false);
  const [hasWalletBackup, setHasWalletBackup] = useState(false);

  useEffect(() => {
    const generatePCD = async () => {
      // pull backup state
      const backup = await loadBackupState();
      if (
        backup !== undefined &&
        (backup.type === "apple" || backup.type === "google")
      ) {
        setHasWalletBackup(true);
      }

      // make the main signature PCD
      let producedPCD;
      try {
        producedPCD = await HaLoNoncePCDPackage.prove(args);
      } catch (e) {
        router.push("/home");
        return;
      }
      if (
        producedPCD === undefined ||
        !(await HaLoNoncePCDPackage.verify(producedPCD))
      ) {
        router.push("/home");
        return;
      }

      // make sure we haven't already collected this sigmoji
      const sigmojis = await loadSigmojis();
      for (const sigmoji of sigmojis) {
        if (
          sigmoji.PCD.claim.pubkeyHex.toLowerCase() ===
          producedPCD.claim.pubkeyHex.toLowerCase()
        ) {
          setImageLink(sigmoji.emojiImg);
          setAlreadyCollected(true);
          return;
        }
      }

      // pull correct image and save sigmoji to localStorage
      for (const entry of Object.entries(cardPubKeys)) {
        if (
          entry[1].secondaryPublicKeyRaw.toLowerCase() ===
          producedPCD.claim.pubkeyHex.toLowerCase()
        ) {
          const newSigmoji: Sigmoji = {
            emojiImg: entry[1].image,
            PCD: producedPCD,
            ZKP: "",
          };
          await saveSigmoji(newSigmoji);
          setImageLink(entry[1].image);
          break;
        }
      }

      setPCD(producedPCD);
    };

    generatePCD();
  }, [args, router]);

  return (
    <Modal>
      <div className="px-2 justify-start items-start inline-flex">
        <div className="w-[264px] flex-col justify-start items-center gap-8 inline-flex text-center">
          {pcd && imageLink ? (
            <>
              <PrimaryFontH3 style={{ color: "var(--woodsmoke-100)" }}>
                Yay, collected!
              </PrimaryFontH3>
              <Image
                src={`/emoji-photo/${imageLink}`}
                width="160"
                height="160"
                alt="emoji"
              />
              <div className="flex-col justify-start items-center gap-6 inline-flex">
                {hasWalletBackup ? (
                  <>
                    <PrimaryFontH4 style={{ color: "var(--woodsmoke-100)" }}>
                      {"Update your backup!"}
                    </PrimaryFontH4>
                    <PrimaryFontSmall
                      style={{
                        textAlign: "center",
                        color: "#888",
                      }}
                    >
                      Your previous wallet backup will be replaced.
                    </PrimaryFontSmall>
                  </>
                ) : (
                  <PrimaryFontH4 style={{ color: "var(--woodsmoke-100)" }}>
                    {"Backup your collection!"}
                  </PrimaryFontH4>
                )}
                <AppleWalletButton />
                <GoogleWalletButton />
              </div>
              {hasWalletBackup ? (
                <></>
              ) : (
                <div className="flex-col justify-start items-center mt-4 gap-6 inline-flex">
                  <PrimaryFontSmall
                    style={{
                      textAlign: "center",
                      color: "#888",
                    }}
                  >
                    Alternatively you can copy/paste the data directly to the
                    encrypted messaging or password manager of your choice.
                  </PrimaryFontSmall>
                  <SecondaryLargeButton
                    onClick={async () => {
                      const sigmojis = await loadSigmojis();
                      const serializedSigmojis = JSON.stringify(sigmojis);
                      navigator.clipboard.writeText(serializedSigmojis);
                    }}
                  >
                    <PrimaryFontBase1 style={{ color: "var(--woodsmoke-100)" }}>
                      Copy data store
                    </PrimaryFontBase1>
                  </SecondaryLargeButton>
                </div>
              )}
            </>
          ) : alreadyCollected ? (
            <>
              <PrimaryFontH3 style={{ color: "var(--woodsmoke-100)" }}>
                {"You've already collected this sigmoji."}
              </PrimaryFontH3>
              <Image
                src={`/emoji-photo/${imageLink}`}
                width="160"
                height="160"
                alt="emoji"
              />
              <SecondaryLargeButton onClick={() => router.push("/home")}>
                <PrimaryFontBase1 style={{ color: "var(--woodsmoke-100)" }}>
                  Back to app
                </PrimaryFontBase1>
                <Image
                  src="/buttons/arrow-right-line.svg"
                  width="16"
                  height="16"
                  alt="arrow"
                />
              </SecondaryLargeButton>{" "}
            </>
          ) : (
            <div className="flex justify-center items-center">
              <LoadingSpinner />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
