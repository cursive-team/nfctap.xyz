import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MembershipVerifier } from "@personaelabs/spartan-ecdsa";
import { Telegraf } from "telegraf";
import path from "path";

const telegramBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
// This is super jank. List of pairs of (chatId, threadId) to send messages to.
const TELEGRAM_TEST_CHAT_IDS = [
  [-4031859798, undefined],
  [-1001963446787, 1414],
];

/**
 * POST /api/anon
 * Posts a pseudonymous chat message which is verified and broadcasted to the Telegram chat bot.
 * @param {object} request - The request object. Consists of the following parameters encoded as JSON.
 * @param {string} request.pseudonym - The pseudonym the user is posting as.
 * @param {string} request.message - The message the user is posting.
 * @param {string} request.serializedZKP - The serialized zero-knowledge proof provided by the user.
 * @returns A JSON response with a success boolean indicating if the chat message was posted.
 */
export async function POST(request: Request) {
  try {
    const bodyArrayBuffer = await request.arrayBuffer();
    const bodyString = new TextDecoder().decode(bodyArrayBuffer);
    const { pseudonym, message, serializedZKP } = JSON.parse(bodyString);

    // can't use deserializeSigmojiZKP due to some Next.js problem
    const parsedZKP = JSON.parse(serializedZKP);
    const zkp = {
      proof: new Uint8Array(parsedZKP.proof),
      publicInputSer: new Uint8Array(parsedZKP.publicInput),
    };

    const verified = await verifyProof(zkp);
    if (!verified) {
      throw new Error("Proof failed verification");
    }

    const fullMessage = `A Sigmoji holder (${pseudonym}): ${message}`;
    for (const [chatId, threadId] of TELEGRAM_TEST_CHAT_IDS) {
      try {
        if (typeof threadId === "undefined") {
          telegramBot.telegram.sendMessage(chatId!, fullMessage);
        } else {
          telegramBot.telegram.sendMessage(chatId!, fullMessage, {
            message_thread_id: threadId,
          });
        }
      } catch (error) {
        console.error(
          `Failed to send chat message to chatId: ${chatId}, threadId: ${threadId}\n`,
          error
        );
      }
    }

    await addAnonChatLog({ message, pseudonym });

    return new NextResponse(undefined, {
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
 * @param zkp - A proof to verify
 * @param zkp.proof - The proof contents as a Uint8Array.
 * @param zkp.publicInputSer - The serialized public input of the proof.
 * @returns A promise that resolves to a boolean indicating whether the proof was verified.
 */
async function verifyProof(zkp: {
  proof: Uint8Array;
  publicInputSer: Uint8Array;
}): Promise<boolean> {
  const verifier = new MembershipVerifier({
    circuit: path.resolve(
      process.cwd(),
      "./app/api/leaderboard/pubkey_membership.circuit"
    ),
    enableProfiler: true,
  });
  await verifier.initWasm();

  return await verifier.verify(zkp.proof, zkp.publicInputSer);
}

/**
 * Adds a new entry to the chat log.
 * @param logEntry - The entry to add.
 * @param logEntry.message - The message that was sent.
 * @param logEntry.pseudonym - The pseudonym of the user.
 */
async function addAnonChatLog(logEntry: {
  message: string;
  pseudonym: string;
}) {
  try {
    const newEntry = await prisma.chatLog.create({
      data: logEntry,
    });
    console.log("New chat log entry:", newEntry);
  } catch (error) {
    console.error("Error adding chat log entry:", error);
  }
}
