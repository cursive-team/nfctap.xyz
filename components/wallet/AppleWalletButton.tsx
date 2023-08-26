import Image from "next/image";
import { useState } from "react";

export const AppleWalletButton = () => {
  return (
    <div className="flex justify-center">
      <a
        style={{ margin: 0 }}
        href={`/api/generateApplePass?signature=0xABCD&owner=0x1234`}
      >
        <Image
          src="/buttons/AddToAppleWallet.svg"
          alt="Add to Apple Wallet"
          width={201}
          height={42}
          sizes="100vw"
        />
      </a>
    </div>
  );
};
