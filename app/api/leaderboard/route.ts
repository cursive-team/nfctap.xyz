import { NextResponse } from "next/server";
import {
  MembershipVerifier,
  defaultPubkeyMembershipVConfig,
} from "@personaelabs/spartan-ecdsa";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // const { number, serial, collection } = Object.fromEntries(
  //   searchParams.entries()
  // );

  const verifier = new MembershipVerifier({
    ...defaultPubkeyMembershipVConfig,
    enableProfiler: true,
  });
  await verifier.initWasm();

  return new NextResponse(null, {
    status: 200,
  });
}
