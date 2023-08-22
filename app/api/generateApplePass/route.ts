import assert from "assert";
import { readFileSync, writeFileSync } from "fs";
import { NextResponse } from "next/server";
import { PKPass } from "passkit-generator";

const { PASSKIT_GENERATOR_PASSPHRASE } = process.env;
assert(
  PASSKIT_GENERATOR_PASSPHRASE,
  "Missing env var PASSKIT_GENERATOR_PASSPHRASE"
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { owner, signature } = Object.fromEntries(searchParams.entries());
  // Check for required params
  if (!owner || !signature) {
    console.error(
      "[/api/generateApplePass] missing 'owner' or 'signature' fields",
      {
        owner,
        signature,
      }
    );
    return NextResponse.error();
  }

  const pkPass = await PKPass.from(
    {
      model: "./models/sigmoji.pass",
      certificates: {
        wwdr: readFileSync("./certs/wwdr.pem"),
        signerCert: readFileSync("./certs/signerCert.pem"),
        signerKey: readFileSync("./certs/signerKey.pem"),
        signerKeyPassphrase: PASSKIT_GENERATOR_PASSPHRASE,
      },
    },
    {
      serialNumber: signature,
    }
  );

  return new NextResponse(pkPass.getAsBuffer(), {
    status: 200,
    headers: {
      "Content-Disposition": 'attachment; filename="sigmoji.pkpass"',
      "Content-Type": "application/vnd.apple.pkpass",
    },
  });
}
