"use client";

import { PrimaryLargeButton } from "@/components/shared/Buttons";
import { SecondaryHeader } from "@/components/shared/Headers";
import { PrimaryFontBase1 } from "@/components/core";
import { useState } from "react";

export default function ClearPage() {
  const [cleared, setCleared] = useState(false);

  return (
    <>
      <SecondaryHeader />
      <div className="flex justify-center items-center">
        <PrimaryLargeButton
          onClick={() => {
            window.localStorage.removeItem("sigmojis");
            window.localStorage.removeItem("backup");
            setCleared(true);
          }}
        >
          <PrimaryFontBase1>
            {cleared ? "Cleared!" : "Clear your collection"}
          </PrimaryFontBase1>
        </PrimaryLargeButton>
      </div>
    </>
  );
}
