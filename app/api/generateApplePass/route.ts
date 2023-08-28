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
  const { number, serial } = Object.fromEntries(searchParams.entries());

  // Check for required params
  if (!number || !serial) {
    console.error(
      "[/api/generateApplePass] missing 'number' or 'serial' field"
    );
    return NextResponse.error();
  }

  if (parseInt(number) > 20) {
    console.error("[/api/generateApplePass] number > 20");
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
      serialNumber: serial,
    }
  );

  pkPass.headerFields.push({
    key: "collected",
    label: "Collected",
    value: number + "/20",
  });

  return new NextResponse(pkPass.getAsBuffer(), {
    status: 200,
    headers: {
      "Content-Disposition": 'attachment; filename="sigmoji.pkpass"',
      "Content-Type": "application/vnd.apple.pkpass",
    },
  });
}
