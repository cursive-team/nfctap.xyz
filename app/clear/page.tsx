"use client";

import { SecondaryHeader } from "@/components/shared/Headers";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ClearPage() {
  const [cleared, setCleared] = useState(false);

  return (
    <>
      <SecondaryHeader />
      <div className="flex justify-center items-center">
        <Button
          onClick={() => {
            window.localStorage.removeItem("sigmojis");
            window.localStorage.removeItem("backup");
            setCleared(true);
          }}
        >
          {cleared ? "Cleared!" : "Clear your collection"}
        </Button>
      </div>
    </>
  );
}
