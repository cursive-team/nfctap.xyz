"use client";

import { useEffect, useState } from "react";
import { PrimaryFontH3, PrimaryFontBase1 } from "../core";
import { PrimaryLargeButton } from "../shared/Buttons";
import {
  ModalBackground,
  ModalContainer,
  ModalDiv,
  ModalHeader,
  OuterContainer,
  InnerContainer,
} from "../shared/Modal";
import { Poseidon } from "@personaelabs/spartan-ecdsa";
import { makeProofs } from "@/lib/zkProving";

export default function ProvingModal() {
  // const [poseidon, setPoseidon] = useState<Poseidon | undefined>(undefined);

  // useEffect(() => {
  //   async function setupPoseidon() {
  //     const poseidon = new Poseidon();
  //     await poseidon.initWasm();
  //     setPoseidon(poseidon);
  //   }

  //   setupPoseidon();
  // });

  return (
    <ModalBackground>
      <ModalContainer>
        <ModalDiv>
          <ModalHeader />
          <OuterContainer>
            <InnerContainer>
              <PrimaryFontH3 style={{ color: "var(--woodsmoke-100)" }}>
                Your score
              </PrimaryFontH3>
              <PrimaryLargeButton onClick={() => makeProofs()}>
                <PrimaryFontBase1>{"PROVE IT!"}</PrimaryFontBase1>
              </PrimaryLargeButton>
            </InnerContainer>
          </OuterContainer>
        </ModalDiv>
      </ModalContainer>
    </ModalBackground>
  );
}
