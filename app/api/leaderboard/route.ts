import { NextResponse } from "next/server";
import {
  MembershipVerifier,
  defaultPubkeyMembershipVConfig,
} from "@personaelabs/spartan-ecdsa";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const leaderboard = await prisma.leaderboard.findMany({
    orderBy: {
      score: "desc",
    },
  });

  return new NextResponse(JSON.stringify(leaderboard), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request) {
  const bodyArrayBuffer = await request.arrayBuffer();
  const bodyString = new TextDecoder().decode(bodyArrayBuffer);
  const { pseudonym, score, serializedZKPArray } = JSON.parse(bodyString);

  const zkpArray = (JSON.parse(serializedZKPArray) as string[]).map((zkp) =>
    JSON.parse(zkp)
  );

  const verified = await verifyProofs(zkpArray);
  const scoreInt = parseInt(score);
  const success = verified && scoreInt;

  if (success) {
    await addLeaderboardEntry(pseudonym, scoreInt);
  }

  return new NextResponse(JSON.stringify({ success }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function verifyProofs(
  proofs: {
    proof: Uint8Array;
    publicInput: Uint8Array;
  }[]
): Promise<boolean> {
  const verifier = new MembershipVerifier({
    ...defaultPubkeyMembershipVConfig,
    enableProfiler: true,
  });
  await verifier.initWasm();

  for (const proof of proofs) {
    const verified = await verifier.verify(proof.proof, proof.publicInput);
    if (!verified) {
      return false;
    }
  }

  return true;
}

async function addLeaderboardEntry(pseudonym: string, score: number) {
  try {
    const newEntry = await prisma.leaderboard.create({
      data: {
        pseudonym: pseudonym,
        score: score,
      },
    });
    console.log("New leaderboard entry:", newEntry);
  } catch (error) {
    console.error("Error adding leaderboard entry:", error);
  }
}
