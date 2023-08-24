import assert from "assert";
import Image from "next/image";
import { PKPass } from "passkit-generator";
import { useState } from "react";

const {
  NEXT_PUBLIC_PASSKIT_GENERATOR_PASSPHRASE,
  NEXT_PUBLIC_PASSKIT_WWDR_BASE64_PEM,
  NEXT_PUBLIC_PASSKIT_SIGNERKEY_BASE64_PEM,
  NEXT_PUBLIC_PASSKIT_SIGNERCERT_BASE64_PEM,
} = process.env;

assert(
  NEXT_PUBLIC_PASSKIT_GENERATOR_PASSPHRASE,
  "Missing at least one passkit env var"
);

async function generatePass(signature: string) {
  assert(NEXT_PUBLIC_PASSKIT_WWDR_BASE64_PEM, "Missing passkit wwdr cert");
  assert(
    NEXT_PUBLIC_PASSKIT_SIGNERKEY_BASE64_PEM,
    "Missing passkit signer key"
  );
  assert(
    NEXT_PUBLIC_PASSKIT_SIGNERCERT_BASE64_PEM,
    "Missing passkit signer cert"
  );
  const pkPass = await PKPass.from(
    {
      model: "./models/sigmoji.pass",
      certificates: {
        wwdr: Buffer.from(
          NEXT_PUBLIC_PASSKIT_WWDR_BASE64_PEM,
          "base64"
        ).toString("utf8"),
        signerCert: Buffer.from(
          NEXT_PUBLIC_PASSKIT_SIGNERCERT_BASE64_PEM,
          "base64"
        ).toString("utf8"),
        signerKey: Buffer.from(
          NEXT_PUBLIC_PASSKIT_SIGNERKEY_BASE64_PEM,
          "base64"
        ).toString("utf8"),
        signerKeyPassphrase: NEXT_PUBLIC_PASSKIT_GENERATOR_PASSPHRASE,
      },
    },
    {
      serialNumber: signature,
    }
  );
  return pkPass.getAsBuffer();
}
function downloadBufferAsFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
) {
  // 1. Convert the buffer to a Blob
  const blob = new Blob([buffer], { type: mimeType });

  // 2. Create an anchor element
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;

  // 3. Append to the document and trigger a click
  document.body.appendChild(link);
  link.click();

  // 4. Remove the anchor element and release the object URL
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export const AppleWalletButton = () => {
  return (
    <div className="flex justify-center">
      <Image
        src="/buttons/AddToAppleWallet.svg"
        alt="Add to Apple Wallet"
        width={0}
        height={0}
        sizes="100vw"
        style={{ width: "auto", height: "42px" }} // optional
        onClick={async () => {
          const buffer = await generatePass("0xabcd");
          downloadBufferAsFile(
            buffer,
            "sigmoji.pkpass",
            "application/vnd.apple.pkpass"
          );
        }}
      />
    </div>
  );
};
