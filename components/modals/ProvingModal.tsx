"use client";

import { useEffect, useState } from "react";
import { Input } from "../shared/Input";
import Modal from "./Modal";
import { addZKPToSigmoji } from "@/lib/zkProving";
import {
  saveLeaderboardEntry,
  serializeSigmojisInLocalStorage,
} from "@/lib/localStorage";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { FieldWrapper } from "../ui/field";
import { useWasm } from "@/hooks/useWasm";
import { useSigmojis } from "@/hooks/useSigmojis";
import { provingTimeString } from "@/lib/utils";

export default function ProvingModal() {
  const router = useRouter();
  const [loadingProof, setLoadingProof] = useState<boolean>(false);

  const { data: { wasm, pubKeyTree } = {}, isLoading: isLoadingWasm } =
    useWasm();
  const { data: sigmojis = [], isLoading: isLoadingSigmojis } = useSigmojis();
  const loadingMetadata = isLoadingWasm || isLoadingSigmojis;

  const [score, setScore] = useState<number>(0);
  const [counter, setCounter] = useState(0);
  const [pseudonym, setPseudonym] = useState<string>("");

  useEffect(() => {
    if (!sigmojis) return;
    setScore(sigmojis.length);
  }, [sigmojis]);

  const makeProofsWithCounter = async (): Promise<{
    serializedZKPArray: string[];
    numUniqueProofs: Number;
  }> => {
    if (!wasm || !pubKeyTree) throw new Error("WASM not initialized");
    setCounter(0);

    // compute proofs in component to track progress for user
    let numExistingProofs = 0;
    const wrappedSigmojis = sigmojis?.map(async (sigmoji) => {
      if (sigmoji.ZKP) {
        numExistingProofs++;
      }
      return addZKPToSigmoji(sigmoji, wasm, pubKeyTree).then((result) => {
        setCounter((prevCounter) => prevCounter + 1);
        return result;
      });
    });
    const sigmojisWithZKP = await Promise.all(wrappedSigmojis as any);
    await serializeSigmojisInLocalStorage(sigmojisWithZKP);
    return {
      serializedZKPArray: sigmojisWithZKP.map((s) => s.ZKP),
      numUniqueProofs: (sigmojis?.length ?? 0) - numExistingProofs,
    };
  };

  const proveAndSubmitScore = async () => {
    if (!wasm) throw new Error("WASM not initialized");
    const startTime = new Date().getTime();
    const { serializedZKPArray, numUniqueProofs } =
      await makeProofsWithCounter();
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
          saveLeaderboardEntry({ pseudonym, score });
          alert(
            `Score successfully verified! Generated ${numUniqueProofs} new proof(s) in: ${provingTimeString(
              provingTime
            )}.`
          );
          router.push("/home");
        } else {
          alert("The proof you submitted was invalid.");
        }
      } else {
        if (data.error) {
          console.error(data.error);
        }
        alert("Error submitting proof to leaderboard.");
      }
    });
  };

  const onProve = async () => {
    if (!wasm) return console.error("WASM not initialized");
    setLoadingProof(true);
    await proveAndSubmitScore();
    setLoadingProof(false);
  };

  const proveText = !loadingMetadata ? "PROVE IT!" : "LOADING...";
  const counterPercentage = (((counter || 0) / (score || 0)) * 100.0).toFixed(
    1
  );
  const isDisabled = loadingProof || loadingMetadata;
  const showCounter = parseInt(counterPercentage) > 0;

  return (
    <Modal
      title={
        <>
          <span className="block font-helvetica text-2xl font-bold text-woodsmoke-100">
            Your score
          </span>
          <span className="block font-helvetica text-4xl font-bold text-snow-flurry-200">
            {score}
          </span>
        </>
      }
      description="Create a pseudonym and make a zk proof to share it on the leaderboard."
    >
      <Input
        disabled={isDisabled}
        header="Pseudonym"
        value={pseudonym}
        setValue={setPseudonym}
      />
      <FieldWrapper
        description={showCounter ? `PROVING ${counterPercentage}%` : ""}
        className="w-full"
      >
        <Button
          className="w-full"
          disabled={isDisabled}
          loading={loadingProof || loadingMetadata}
          onClick={onProve}
        >
          <span className="font-helvetica font-medium text-base">
            {proveText}
          </span>
        </Button>
      </FieldWrapper>
    </Modal>
  );
}
