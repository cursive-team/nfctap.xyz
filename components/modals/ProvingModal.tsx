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
import {
  loadSigmojis,
  serializeSigmojisInLocalStorage,
} from "@/lib/localStorage";
import { useRouter } from "next/navigation";
import { serializeSigmoji } from "@/lib/types";

export default function ProvingModal() {
  const router = useRouter();

  const [wasm, setWasm] = useState<ProverWasm>();
  const [pseudonym, setPseudonym] = useState<string>("");

  const [proving, setProving] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    async function setup() {
      if (!wasm) {
        setWasm(await initWasm());
      }

      const sigmojis = await loadSigmojis();
      setScore(sigmojis.length);
    }

    setup();
  });

  const makeProofsWithCounter = async () => {
    if (!wasm) return;

    setCounter(0);
    setProving(true);

    const pubKeyTree = setupTree(wasm);
    const sigmojis = await loadSigmojis();

    // compute proofs in component to track progress for user
    const wrappedSigmojis = sigmojis.map((sigmoji) =>
      addZKPToSigmoji(sigmoji, wasm, pubKeyTree).then((result) => {
        setCounter((prevCounter) => prevCounter + 1);
        return result;
      })
    );
    const sigmojisWithZKP = await Promise.all(wrappedSigmojis);
    serializeSigmojisInLocalStorage(sigmojisWithZKP);
    const serializedZKPArray = sigmojisWithZKP.map((s) => s.ZKP);

    fetch("/api/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pseudonym: pseudonym,
        score: score,
        serializedZKPArray: serializedZKPArray,
      }),
    }).then(async (response) => {
      setProving(false);

      if (response.status === 200) {
        const data = await response.json();
        if (data.success) {
          alert("Proof successfully verified!");
          router.push("/home");
        } else {
          alert("Proof failed to verify.");
        }
      } else {
        console.error("Error submitting proof to leaderboard");
      }
    });
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
              {score}
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
              {!wasm
                ? "LOADING..."
                : !proving
                ? "PROVE IT!"
                : `PROVING ${((counter / score) * 100.0).toFixed(1)}%`}
            </PrimaryFontBase1>
          </PrimaryLargeButton>
        </InnerContainer>
      </OuterContainer>
    </Modal>
  );
}
