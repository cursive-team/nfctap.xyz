"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sigmoji, deserializeSigmoji } from "@/lib/types";
import { updateSigmojiList } from "@/lib/localStorage";

export default function RecoverPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const recoverBackup = async () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(location.search);
        const sigmojis = await getCollectionFromParams(urlParams);
        await updateSigmojiList(sigmojis);
        router.push("/home");
      }
    };
    recoverBackup();
  }, [params, router]);

  return <></>;
}

function getCollectionFromParams(params: URLSearchParams): Promise<Sigmoji[]> {
  const collection = params.get("collection");
  if (!collection) {
    return Promise.resolve([]);
  }

  const serializedSigmojis = JSON.parse(collection);
  if (!Array.isArray(serializedSigmojis)) {
    return Promise.resolve([]);
  }

  return Promise.all(serializedSigmojis.map(deserializeSigmoji));
}
