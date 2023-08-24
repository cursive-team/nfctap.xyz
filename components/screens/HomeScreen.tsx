import { MainHeader } from "@/components/shared/Headers";
import Chevron from "../shared/Chevron";
import { useState } from "react";
import Footer from "../shared/Footer";

export default function HomeScreen() {
  const [collectionOpen, setCollectionOpen] = useState<boolean>(true);
  const [revealedScoresOpen, setRevealedScoresOpen] = useState<boolean>(true);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <MainHeader />
      <Chevron
        text={"MY COLLECTION"}
        isOpen={collectionOpen}
        setIsOpen={setCollectionOpen}
      />
      <Chevron
        text={"REVEALED SCORES"}
        isOpen={revealedScoresOpen}
        setIsOpen={setRevealedScoresOpen}
      />
      <div style={{ marginTop: "auto" }}>
        <Footer />
      </div>
    </div>
  );
}
