"use client";

import React, { useState, useEffect } from "react";
import { isStorageEmpty } from "@/lib/localStorage";
import CollectedModal from "@/components/modals/CollectedModal";
import FirstTimeUserScreen, {
  FirstTimeUserResponse,
} from "@/components/screens/FirstTimeUserScreen";
import RetrieveHelpScreen from "@/components/screens/RetrieveHelpScreen";

export default function TapPage() {
  const [storageEmpty, setStorageEmpty] = useState<boolean | null>(null);
  const [userResponse, setUserResponse] = useState<FirstTimeUserResponse>(
    FirstTimeUserResponse.NONE
  );

  useEffect(() => {
    const checkStorage = async () => {
      const isEmpty = await isStorageEmpty();
      setStorageEmpty(isEmpty);
    };
    checkStorage();
  }, []);

  if (storageEmpty === null) {
    return null; // or a loading spinner
  } else if (storageEmpty && userResponse === FirstTimeUserResponse.NONE) {
    return <FirstTimeUserScreen setUserResponse={setUserResponse} />;
  } else if (!storageEmpty || userResponse === FirstTimeUserResponse.YES) {
    return <CollectedModal />;
  } else if (userResponse === FirstTimeUserResponse.RETRIEVE) {
    return <RetrieveHelpScreen />;
  }
}

function getSignature(params: URLSearchParams) {
  const pk2 = params.get("pk2");
  const rnd = params.get("rnd");
  const rndsig = params.get("rndsig");

  if (pk2 == null || rnd == null || rndsig == null) {
    return null;
  } else {
  }
}
