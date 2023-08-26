"use client";

import { useState, useEffect } from "react";
import { isStorageEmpty } from "@/lib/localStorage";
import CollectedModal from "@/components/modals/CollectedModal";
import FirstTimeUserScreen, {
  FirstTimeUserResponse,
} from "@/components/screens/FirstTimeUserScreen";
import RetrieveHelpScreen from "@/components/screens/RetrieveHelpScreen";
import { HaLoNoncePCDArgs } from "@pcd/halo-nonce-pcd";
import { ArgumentTypeName } from "@pcd/pcd-types";
import { useRouter, useParams } from "next/navigation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SecondaryHeader } from "@/components/shared/Headers";

export default function TapPage() {
  const router = useRouter();
  const params = useParams();

  const [storageEmpty, setStorageEmpty] = useState<boolean | null>(null);
  const [userResponse, setUserResponse] = useState<FirstTimeUserResponse>(
    FirstTimeUserResponse.NONE
  );
  const [args, setArgs] = useState<HaLoNoncePCDArgs | null>(null);

  useEffect(() => {
    if (args === null && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(location.hash.slice(1));
      const haloArgs = getHaLoArgs(urlParams);
      if (haloArgs === null) {
        router.push("/home");
      } else {
        setArgs(haloArgs);
      }
    }
  }, [params, router, args]);

  useEffect(() => {
    const checkStorage = async () => {
      const isEmpty = await isStorageEmpty();
      setStorageEmpty(isEmpty);
    };
    checkStorage();
  }, []);

  if (args === null || storageEmpty === null) {
    return (
      <>
        <SecondaryHeader />
        <div className="flex justify-center items-center">
          <LoadingSpinner />
        </div>
      </>
    );
  } else if (storageEmpty && userResponse === FirstTimeUserResponse.NONE) {
    return <FirstTimeUserScreen setUserResponse={setUserResponse} />;
  } else if (
    args !== null &&
    (!storageEmpty || userResponse === FirstTimeUserResponse.YES)
  ) {
    return <CollectedModal args={args} />;
  } else if (userResponse === FirstTimeUserResponse.RETRIEVE) {
    return <RetrieveHelpScreen />;
  }
  return null;
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
