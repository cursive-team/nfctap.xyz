import { NextResponse } from "next/server";
import {
  MembershipVerifier,
  defaultPubkeyMembershipVConfig,
} from "@personaelabs/spartan-ecdsa";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const { pseudonym, score, serializedZKPArray } = Object.fromEntries(
    searchParams.entries()
  );

  const verifier = new MembershipVerifier({
    ...defaultPubkeyMembershipVConfig,
    enableProfiler: true,
  });
  await verifier.initWasm();

  return new NextResponse(null, {
    status: 200,
  });
}
