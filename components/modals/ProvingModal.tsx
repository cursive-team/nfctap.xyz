"use client";

import { useEffect, useState } from "react";
import {
  PrimaryFontH1,
  PrimaryFontH3,
  PrimaryFontBase,
  PrimaryFontBase1,
} from "../core";
import { Input } from "../shared/Input";
import { PrimaryLargeButton } from "../shared/Buttons";
import { OuterContainer, InnerContainer } from "../shared/Modal";
import Modal from "./Modal";
import {
  ProverWasm,
  initWasm,
  setupTree,
  addZKPToSigmoji,
} from "@/lib/zkProving";
import { loadSigmojis } from "@/lib/localStorage";

export default function ProvingModal() {
  const [wasm, setWasm] = useState<ProverWasm>();
  const [pseudonym, setPseudonym] = useState<string>("");

  const [startedProving, setStartedProving] = useState<boolean>(true); // TODO: [startedProving, setStartedProving
  const [score, setScore] = useState<number>(0);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    async function setup() {
      if (!wasm) {
        setWasm(await initWasm());
      }
    }

    setup();
  });

  const makeProofsWithCounter = async () => {
    if (!wasm) return;

    setStartedProving(true);

    const pubKeyTree = setupTree(wasm);
    const sigmojis = await loadSigmojis();
    setScore(sigmojis.length);
    const sigmojiPromises = sigmojis.map((sigmoji) =>
      addZKPToSigmoji(sigmoji, wasm, pubKeyTree)
    );
    const wrappedSigmojiPromises = sigmojiPromises.map((p) =>
      p.then((result) => {
        setCounter((prevCounter) => prevCounter + 1);
        return result;
      })
    );

    await Promise.all(wrappedSigmojiPromises);
  };

  return (
    <Modal>
      <OuterContainer>
        <InnerContainer>
          <div className="flex-col justify-center items-center gap-2 inline-flex">
            <PrimaryFontH3 style={{ color: "var(--woodsmoke-100)" }}>
              Your score
            </PrimaryFontH3>
            <PrimaryFontH1 style={{ color: "var(--snow-flurry-200)" }}>
              832
            </PrimaryFontH1>
          </div>

          <PrimaryFontBase style={{ color: "var(--woodsmoke-100)" }}>
            Create a pseudonym and make a zk proof to share it on the
            leaderboard.
          </PrimaryFontBase>

          <Input header="Pseudonym" value={pseudonym} setValue={setPseudonym} />

          <PrimaryLargeButton
            onClick={() => (wasm ? makeProofsWithCounter() : {})}
          >
            <PrimaryFontBase1>
              {wasm && !startedProving ? "PROVE IT!" : "Loading..."}
            </PrimaryFontBase1>
          </PrimaryLargeButton>
        </InnerContainer>
      </OuterContainer>
    </Modal>
  );
}
