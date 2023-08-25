import assert from "assert";
import { NextResponse } from "next/server";
import { PKPass } from "passkit-generator";
import path from "path";
import process from "process";

const {
  PASSKIT_GENERATOR_PASSPHRASE,
  PASSKIT_WWDR_BASE64_PEM,
  PASSKIT_SIGNERKEY_BASE64_PEM,
  PASSKIT_SIGNERCERT_BASE64_PEM,
} = process.env;
assert(PASSKIT_GENERATOR_PASSPHRASE, "Missing at least one passkit env var");

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

  assert(PASSKIT_WWDR_BASE64_PEM, "Missing passkit wwdr cert");
  assert(PASSKIT_SIGNERKEY_BASE64_PEM, "Missing passkit signer key");
  assert(PASSKIT_SIGNERCERT_BASE64_PEM, "Missing passkit signer cert");

  const pkPass = await PKPass.from(
    {
      model: path.resolve(
        process.cwd(),
        "./app/api/generateApplePass/models/sigmoji.pass"
      ),
      certificates: {
        wwdr: Buffer.from(PASSKIT_WWDR_BASE64_PEM, "base64").toString("utf8"),
        signerCert: Buffer.from(
          PASSKIT_SIGNERCERT_BASE64_PEM,
          "base64"
        ).toString("utf8"),
        signerKey: Buffer.from(PASSKIT_SIGNERKEY_BASE64_PEM, "base64").toString(
          "utf8"
        ),
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
