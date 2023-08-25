"use client";

import React, { useState, useEffect } from "react";
import { isStorageEmpty } from "@/lib/localStorage";
import CollectedModal from "@/components/modals/CollectedModal";
import FirstTimeUserScreen, {
  FirstTimeUserResponse,
} from "@/components/screens/FirstTimeUserScreen";
import RetrieveHelpScreen from "@/components/screens/RetrieveHelpScreen";
import { HaLoNoncePCDArgs } from "@pcd/halo-nonce-pcd";
import { ArgumentTypeName } from "@pcd/pcd-types";
import { useRouter } from "next/navigation";
import { Yaldevi } from "next/font/google";

export default function TapPage() {
  const router = useRouter();
  const [storageEmpty, setStorageEmpty] = useState<boolean | null>(null);
  const [userResponse, setUserResponse] = useState<FirstTimeUserResponse>(
    FirstTimeUserResponse.NONE
  );

  // get query strings that come after hash in url
  const params = new URLSearchParams(window.location.hash.slice(1));
  const args = getHaLoArgs(params);

  useEffect(() => {
    const checkStorage = async () => {
      const isEmpty = await isStorageEmpty();
      setStorageEmpty(isEmpty);
    };
    checkStorage();
  }, []);

  if (args === null) {
    router.push("/home");
    return null;
  } else if (storageEmpty === null) {
    return null; // or a loading spinner
  } else if (storageEmpty && userResponse === FirstTimeUserResponse.NONE) {
    return <FirstTimeUserScreen setUserResponse={setUserResponse} />;
  } else if (!storageEmpty || userResponse === FirstTimeUserResponse.YES) {
    return <CollectedModal args={args} />;
  } else if (userResponse === FirstTimeUserResponse.RETRIEVE) {
    return <RetrieveHelpScreen />;
  }
}

function getHaLoArgs(params: URLSearchParams): HaLoNoncePCDArgs | null {
  const pk2 = params.get("pk2");
  const rnd = params.get("rnd");
  const rndsig = params.get("rndsig");

  if (pk2 == null || rnd == null || rndsig == null) {
    return null;
  } else {
    const args: HaLoNoncePCDArgs = {
      pk2: {
        argumentType: ArgumentTypeName.String,
        value: pk2,
      },
      rnd: {
        argumentType: ArgumentTypeName.String,
        value: rnd,
      },
      rndsig: {
        argumentType: ArgumentTypeName.String,
        value: rndsig,
      },
    };
    return args;
  }
}
