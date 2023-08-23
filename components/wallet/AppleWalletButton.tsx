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
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "auto", height: "42px" }} // optional
        />
      </a>
    </div>
  );
};
