import { NextResponse } from "next/server";
import { MembershipVerifier } from "@personaelabs/spartan-ecdsa";
import prisma from "@/lib/prisma";
import { Telegraf } from "telegraf";
import path from "path";

const telegramBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const TELEGRAM_TEST_CHAT_ID = -1001963446787;
const emojiMap: { [key: string]: string } = {
  "robot.png": "🤖",
  "invader.png": "👾",
  "ninja.png": "🥷",
  "turtle.png": "🐢",
  "pizza.png": "🍕",
  "pinata.png": "🪅",
  "unicorn.png": "🦄",
  "mushroom.png": "🍄",
  "soccer.png": "⚽️",
  "pumpkin.png": "🎃",
  "avocado.png": "🥑",
  "nerd.png": "🤓",
  "ghost.png": "👻",
  "cowboy.png": "🤠",
  "alien.png": "👽",
  "icecream.png": "🍦",
  "fairy.png": "🧚",
  "butterfly.png": "🦋",
  "bubbles.png": "🧼",
  "dolphin.png": "🐬",
  "angry-cat.png": "😾",
  "baby-angel.png": "👼",
  "blue-swirl.png": "🌀",
  "boba.png": "🧋",
  "caterpillar.png": "🐛",
  "clown.png": "🤡",
  "cookie.png": "🍪",
  "crystal-ball.png": "🔮",
  "dumpling.png": "🥟",
  "eyes.png": "👀",
  "fingers-crossed.png": "🤞",
  "handshake.png": "🤝",
  "head-exploding.png": "🤯",
  "lollipop.png": "🍭",
  "magic-wand.png": "🪄",
  "palette.png": "🎨",
  "poop.png": "💩",
  "skull.png": "💀",
  "sloth.png": "🦥",
  "squirrel.png": "🐿",
};

/**
 * POST /api/chat
 * Posts a pseudonymous chat message which is verified and broadcasted to the Telegram chat bot.
 * @param {object} request - The request object. Consists of the following parameters encoded as JSON.
 * @param {string} request.message - The message the user is posting.
 * @param {string} request.sigmoji - The Sigmoji the user is posting as. Currently represents the emojiImg of the Sigmoji.
 * @param {string} request.serializedZKP - The serialized zero-knowledge proof provided by the user.
 * @returns A JSON response with a success boolean indicating if the chat message was posted.
 */
export async function POST(request: Request) {
  try {
    const bodyArrayBuffer = await request.arrayBuffer();
    const bodyString = new TextDecoder().decode(bodyArrayBuffer);
    const { message, sigmoji, serializedZKP } = JSON.parse(bodyString);

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

    if (!emojiMap.hasOwnProperty(sigmoji)) {
      throw new Error("Sigmoji not found");
    }

    const emoji = emojiMap[sigmoji];
    const fullMessage = `${emoji}: ${message}`;
    telegramBot.telegram.sendMessage(TELEGRAM_TEST_CHAT_ID, fullMessage, {
      message_thread_id: 1414,
    });

    await addChatLog({ message, sigmoji });

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
 * @param logEntry.sigmoji - The Sigmoji the user is posting as. Currently represents the emojiImg of the Sigmoji.
 */
async function addChatLog(logEntry: { message: string; sigmoji: string }) {
  try {
    const newEntry = await prisma.chatLog.create({
      data: logEntry,
    });
    console.log("New chat log entry:", newEntry);
  } catch (error) {
    console.error("Error adding chat log entry:", error);
  }
}
