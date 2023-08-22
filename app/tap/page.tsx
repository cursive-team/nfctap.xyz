"use client";

import CollectedModal from "@/components/modals/CollectedModal";
import EmptyStorageScreen from "@/components/screens/EmptyStorageScreen";

export default function TapPage() {
  // const hash = window.location.hash.substring(1); // Remove the leading '#'
  // const params = new URLSearchParams(hash);
  // console.log(params);
  // check status of localStorage to determine which screen to show

  return <CollectedModal />;
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
