import { NextResponse } from "next/server";
import { MembershipVerifier } from "@personaelabs/spartan-ecdsa";
import prisma from "@/lib/prisma";
import path from "path";

const ZERO_KNOWLEDGE_PROOF_TYPE = "SPARTAN_ECDSA_SECP256K1";

/**
 * GET /api/leaderboard
 * Gets all entries of the leaderboard.
 * @returns A JSON response with the serialized leaderboard entries.
 */
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

/**
 * POST /api/leaderboard
 * Receives a set of proofs claiming a certain score. Verifies proofs, and adds a new entry to the leaderboard.
 * @param {object}   request - The request object. Consists of the following parameters encoded as JSON.
 * @param {string}   request.pseudonym - The pseudonym of the user.
 * @param {string}   request.score - The score of the user.
 * @param {string[]} request.serializedZKPArray - The array of serialized zero-knowledge proofs.
 * @param {string}   request.provingTime - The proving time it took the user to generate the proofs.
 * @param {string}   request.proofCount - The number of new proofs the user had to generate.
 * @returns A JSON response with a success boolean indicating whether the proofs were verified.
 * @throws Throws an error if there was a problem adding the entry to the database.
 */
export async function POST(request: Request) {
  try {
    const bodyArrayBuffer = await request.arrayBuffer();
    const bodyString = new TextDecoder().decode(bodyArrayBuffer);
    const { pseudonym, score, serializedZKPArray, provingTime, proofCount } =
      JSON.parse(bodyString);

    // can't use deserializeSigmojiZKP due to some Next.js problem
    const zkpArray = (serializedZKPArray || []).map((serializedZKP: string) => {
      const data = JSON.parse(serializedZKP);
      return {
        proof: new Uint8Array(data.proof),
        publicInputSer: new Uint8Array(data.publicInput),
      };
    });

    const verified = await verifyProofs(zkpArray);
    const scoreInt = parseInt(score) || 0;
    const success = verified && scoreInt;

    if (success) {
      await addLeaderboardEntry({ pseudonym, score: scoreInt });
    }

    const provingTimeInt = parseInt(provingTime);
    const proofCountInt = parseInt(proofCount) || 0;

    if (Number.isInteger(provingTimeInt)) {
      await addProofLog({
        pseudonym,
        score: scoreInt,
        provingTime: provingTimeInt,
        proofCount: proofCountInt,
        verified,
      });
    }

    return new NextResponse(JSON.stringify({ success }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Verifies an array of proofs.
 * @param proofs - An array of proofs to verify.
 * @param proofs[].proof - The proof contents as a Uint8Array.
 * @param proofs[].publicInputSer - The serialized public input of the proof.
 * @returns A promise that resolves to a boolean indicating whether all proofs were verified.
 */
async function verifyProofs(
  proofs: {
    proof: Uint8Array;
    publicInputSer: Uint8Array;
  }[]
): Promise<boolean> {
  const verifier = new MembershipVerifier({
    circuit: path.resolve(
      process.cwd(),
      "./app/api/leaderboard/pubkey_membership.circuit"
    ),
    enableProfiler: true,
  });
  await verifier.initWasm();

  for (const proof of proofs) {
    const verified = await verifier.verify(proof.proof, proof.publicInputSer);
    console.log(verified);
    if (!verified) {
      return false;
    }
  }

  return true;
}

/**
 * Adds a new entry to the leaderboard.
 * @param entry - The entry to add.
 * @param entry.pseudonym - The pseudonym of the user.
 * @param entry.score - The score of the user.
 */
async function addLeaderboardEntry(entry: {
  pseudonym: string;
  score: number;
}) {
  try {
    const newEntry = await prisma.leaderboard.create({
      data: entry,
    });
    console.log("New leaderboard entry:", newEntry);
  } catch (error) {
    console.error("Error adding leaderboard entry:", error);
  }
}

/**
 * Adds a new entry to the proof log.
 * @param logEntry - The entry to add.
 * @param logEntry.pseudonym - The pseudonym of the user.
 * @param logEntry.score - The score of the user.
 * @param logEntry.provingTime - The proving time it took the user to generate the proofs.
 * @param logEntry.proofCount - The number of new proofs the user had to generate.
 * @param logEntry.verified - Whether the proofs were verified.
 */
async function addProofLog(logEntry: {
  pseudonym: string;
  score: number;
  provingTime: number;
  proofCount: number;
  verified: boolean;
}) {
  try {
    const newEntry = await prisma.proofLog.create({
      data: { ...logEntry, proofType: ZERO_KNOWLEDGE_PROOF_TYPE },
    });
    console.log("New proof log entry:", newEntry);
  } catch (error) {
    console.error("Error adding proof log entry:", error);
  }
}
