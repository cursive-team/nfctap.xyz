import Image from "next/image";
import { useState } from "react";

export const GoogleWalletButton = () => {
  const [clickMessage, setClickMessage] = useState("");

  const handleClick = () => {
    console.log("Button clicked!");
    setClickMessage("Button clicked!");
  };

  return (
    <div className="flex justify-center mt-5">
      <button onClick={handleClick}>
        <Image
          src="/AddToGoogleWallet.svg"
          alt="Add To Google Wallet"
          width={241}
          height={64}
        />
      </button>
    </div>
  );
};
