"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sigmoji, deserializeSigmoji } from "@/lib/types";
import { updateSigmojiList } from "@/lib/localStorage";
import { MainHeader } from "@/components/shared/Headers";
import Footer from "@/components/shared/Footer";

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
        router.push("/");
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
      <div className="flex flex-col gap-4 p-4 text-center self-stretch items-center">
        <span className="courier-font-base">{getRecoverText()}</span>
      </div>
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