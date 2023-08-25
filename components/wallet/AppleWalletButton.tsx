import {
  iconBase64,
  logoBase64,
  stripBase64,
  jsonBase64,
} from "@/lib/passBufferOutput";
import assert from "assert";
import Image from "next/image";
import { PKPass } from "passkit-generator";
import { v4 as uuidv4 } from "uuid";

assert(
  process.env.NEXT_PUBLIC_PASSKIT_GENERATOR_PASSPHRASE,
  "Missing at least one passkit env var"
);

async function generatePass(signature: string) {
  assert(
    process.env.NEXT_PUBLIC_PASSKIT_WWDR_BASE64_PEM,
    "Missing passkit wwdr cert"
  );
  assert(
    process.env.NEXT_PUBLIC_PASSKIT_SIGNERKEY_BASE64_PEM,
    "Missing passkit signer key"
  );
  assert(
    process.env.NEXT_PUBLIC_PASSKIT_SIGNERCERT_BASE64_PEM,
    "Missing passkit signer cert"
  );
  const pkPass = new PKPass(
    {
      "pass.json": Buffer.from(jsonBase64, "base64"),
      "icon.png": Buffer.from(iconBase64, "base64"),
      "logo.png": Buffer.from(logoBase64, "base64"),
      "strip.png": Buffer.from(stripBase64, "base64"),
    },
    {
      wwdr: Buffer.from(
        process.env.NEXT_PUBLIC_PASSKIT_WWDR_BASE64_PEM,
        "base64"
      ).toString("utf8"),
      signerCert: Buffer.from(
        process.env.NEXT_PUBLIC_PASSKIT_SIGNERCERT_BASE64_PEM,
        "base64"
      ).toString("utf8"),
      signerKey: Buffer.from(
        process.env.NEXT_PUBLIC_PASSKIT_SIGNERKEY_BASE64_PEM,
        "base64"
      ).toString("utf8"),
      signerKeyPassphrase: process.env.NEXT_PUBLIC_PASSKIT_GENERATOR_PASSPHRASE,
    },
    {
      serialNumber: uuidv4(),
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
