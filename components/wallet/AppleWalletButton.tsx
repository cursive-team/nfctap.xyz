import Image from "next/image";
import { useState } from "react";

export const AppleWalletButton = () => {
  const handleClick = () => {};

  return (
    <div className="flex justify-center mt-5">
      <a href={`/api/generateApplePass?signature=0xABCD&owner=0x1234`}>
        <button onClick={handleClick}>
          <Image
            src="/buttons/AddToAppleWallet.svg"
            alt="Add to Apple Wallet"
            width={241}
            height={64}
          />
        </button>
      </a>
    </div>
  );
};
