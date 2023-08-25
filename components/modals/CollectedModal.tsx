"use client";

import { AppleWalletButton } from "../wallet/AppleWalletButton";
import { GoogleWalletButton } from "../wallet/GoogleWalletButton";
import {
  ModalBackground,
  ModalContainer,
  ModalDiv,
  ModalHeader,
} from "../shared/Modal";
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

export default function CollectedModal({ args }: { args: HaLoNoncePCDArgs }) {
  const [pcd, setPCD] = useState<HaLoNoncePCD | undefined>(undefined);
  const [invalidPCD, setInvalidPCD] = useState(false);

  useEffect(() => {
    const generatePCD = async () => {
      let producedPCD;
      try {
        producedPCD = await HaLoNoncePCDPackage.prove(args);
      } catch (e) {
        setInvalidPCD(true);
      }
      if (producedPCD && !(await HaLoNoncePCDPackage.verify(producedPCD))) {
        setInvalidPCD(true);
      }
      setPCD(producedPCD);
    };

    generatePCD();
  }, [args]);

  useEffect(() => {}, [pcd]);

  return (
    <ModalBackground>
      <ModalContainer>
        <ModalDiv>
          <ModalHeader />
          <div className="px-2 justify-start items-start inline-flex">
            <div className="w-[264px] flex-col justify-start items-center gap-8 inline-flex">
              <PrimaryFontH3 style={{ color: "var(--woodsmoke-100)" }}>
                Yay, collected!
              </PrimaryFontH3>
              <Image
                src="/dolphin.png"
                width="162"
                height="142"
                alt="Dolphin"
              />
              <div className="flex-col justify-start items-center gap-6 inline-flex">
                <PrimaryFontH4 style={{ color: "var(--woodsmoke-100)" }}>
                  Backup your collection!
                </PrimaryFontH4>
                <AppleWalletButton />
                <GoogleWalletButton />
              </div>
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
                <SecondaryLargeButton>
                  <PrimaryFontBase1 style={{ color: "var(--woodsmoke-100)" }}>
                    Copy data store
                  </PrimaryFontBase1>
                </SecondaryLargeButton>
              </div>
            </div>
          </div>
        </ModalDiv>
      </ModalContainer>
    </ModalBackground>
  );
}
