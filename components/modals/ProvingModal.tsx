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
  saveLeaderboardEntry,
  serializeSigmojisInLocalStorage,
} from "@/lib/localStorage";
import { useRouter } from "next/navigation";

enum ProvingState {
  LOADING,
  READY_TO_PROVE,
  PROVING,
  SUBMITTING,
  SUCCESS,
}

export default function ProvingModal() {
  const router = useRouter();
  const [provingState, setProvingState] = useState<ProvingState>(
    ProvingState.LOADING
  );
  const [wasm, setWasm] = useState<ProverWasm>();
  const [score, setScore] = useState<number>(0);
  const [counter, setCounter] = useState(0);
  const [pseudonym, setPseudonym] = useState<string>("");

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

  useEffect(() => {
    if (wasm) {
      setProvingState(ProvingState.READY_TO_PROVE);
    }
  }, [wasm]);

  const makeProofsWithCounter = async (): Promise<{
    serializedZKPArray: string[];
    numUniqueProofs: Number;
  }> => {
    if (!wasm) throw new Error("WASM not initialized");

    setCounter(0);

    const pubKeyTree = setupTree(wasm);
    const sigmojis = await loadSigmojis();

    // compute proofs in component to track progress for user
    let numExistingProofs = 0;
    const wrappedSigmojis = sigmojis.map(async (sigmoji) => {
      if (sigmoji.ZKP) {
        numExistingProofs++;
      }
      return addZKPToSigmoji(sigmoji, wasm, pubKeyTree).then((result) => {
        setCounter((prevCounter) => prevCounter + 1);
        return result;
      });
    });
    const sigmojisWithZKP = await Promise.all(wrappedSigmojis);
    await serializeSigmojisInLocalStorage(sigmojisWithZKP);
    return {
      serializedZKPArray: sigmojisWithZKP.map((s) => s.ZKP),
      numUniqueProofs: sigmojis.length - numExistingProofs,
    };
  };

  const proveAndSubmitScore = async () => {
    setProvingState(ProvingState.PROVING);
    const startTime = new Date().getTime();
    const { serializedZKPArray, numUniqueProofs } =
      await makeProofsWithCounter();
    setProvingState(ProvingState.SUBMITTING);
    const endTime = new Date().getTime();
    const provingTime = endTime - startTime;

    await fetch("/api/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pseudonym,
        score,
        serializedZKPArray,
        provingTime,
        proofCount: numUniqueProofs,
      }),
    }).then(async (response) => {
      const data = await response.json();
      if (response.status === 200) {
        if (data.success) {
          setProvingState(ProvingState.SUCCESS);
          saveLeaderboardEntry({ pseudonym, score });
          alert(
            `Score successfully verified! Generated ${numUniqueProofs} new proof(s) in: ${provingTimeString(
              provingTime
            )}.`
          );
          router.push("/home");
        } else {
          setProvingState(ProvingState.READY_TO_PROVE);
          alert("The proof you submitted was invalid.");
        }
      } else {
        setProvingState(ProvingState.READY_TO_PROVE);
        if (data.error) {
          console.error(data.error);
        }
        alert("Error submitting proof to leaderboard.");
      }
    });
  };

  const provingTimeString = (duration: number): string => {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor(duration / (1000 * 60 * 60));

    let timeString = `${seconds}s`;
    if (minutes > 0 || hours > 0) {
      timeString = `${minutes}m ${timeString}`;
    }
    if (hours > 0) {
      timeString = `${hours}h ${timeString}`;
    }

    return timeString;
  };

  const buttonText = () => {
    switch (provingState) {
      case ProvingState.LOADING:
        return "LOADING...";
      case ProvingState.READY_TO_PROVE:
        return "PROVE IT!";
      case ProvingState.PROVING:
        return `PROVING ${((counter / score) * 100.0).toFixed(1)}%`;
      case ProvingState.SUBMITTING:
        return "SUBMITTING PROOF...";
      case ProvingState.SUCCESS:
        return "SUCCESS!";
    }
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

          <PrimaryLargeButton onClick={wasm ? proveAndSubmitScore : () => {}}>
            <PrimaryFontBase1>{buttonText()}</PrimaryFontBase1>
          </PrimaryLargeButton>
        </InnerContainer>
      </OuterContainer>
    </Modal>
  );
}
