"use client";

import styled from "styled-components";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sigmoji, deserializeSigmoji } from "@/lib/types";
import { updateSigmojiList } from "@/lib/localStorage";
import { MainHeader } from "@/components/shared/Headers";
import Footer from "@/components/shared/Footer";
import { CourierPrimeBase } from "@/components/core";

enum RecoverState {
  RECOVERING,
  RECOVERED,
  ERROR,
}

export default function RecoverScreen() {
  const [recoverState, setRecoverState] = useState<RecoverState>(
    RecoverState.RECOVERING
  );
  const [recoveryString, setRecoveryString] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    const recoverBackup = async () => {
      if (typeof window === "undefined") {
        return;
      }

      // Prevents rerunning of effect
      if (recoveryString === location.search) {
        return;
      }
      setRecoveryString(location.search);

      try {
        const urlParams = new URLSearchParams(location.search);
        const sigmojis = await getCollectionFromParams(urlParams);
        await updateSigmojiList(sigmojis);
        setRecoverState(RecoverState.RECOVERED);
        alert(`Successfully recovered ${sigmojis.length} sigmojis!`);
        router.push("/home");
      } catch (err) {
        console.error(err);
        setRecoverState(RecoverState.ERROR);
      }
    };
    recoverBackup();
  }, [router, recoveryString]);

  const getRecoverText = () => {
    switch (recoverState) {
      case RecoverState.RECOVERING:
        return "Recovering your collection...";
      case RecoverState.RECOVERED:
        return "Successfully recovered your collection!";
      case RecoverState.ERROR:
        return "Error recovering your collection. Please try again.";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <RecoverContainer>
        <CourierPrimeBase>{getRecoverText()}</CourierPrimeBase>
      </RecoverContainer>
      <div style={{ marginTop: "auto" }}>
        <Footer />
      </div>
    </div>
  );
}

function getCollectionFromParams(params: URLSearchParams): Promise<Sigmoji[]> {
  const collection = params.get("collection");
  if (!collection) {
    throw new Error("No collection found in URL params");
  }

  const serializedSigmojis = JSON.parse(collection);
  if (!Array.isArray(serializedSigmojis)) {
    throw new Error("Collection in URL params is not an array");
  }

  return Promise.all(serializedSigmojis.map(deserializeSigmoji));
}

const RecoverContainer = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  flex-direction: column;
  text-align: center;
  align-items: center;
  align-self: stretch;
`;
