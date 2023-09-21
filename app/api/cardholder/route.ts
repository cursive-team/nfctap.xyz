import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Telegraf } from "telegraf";
import { cardPubKeys } from "@/lib/cardPubKeys";
import { recoverPublicKey } from "ethers/lib/utils";
import { hashMessage } from "@/lib/signatureUtils";

const telegramBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const TELEGRAM_TEST_CHAT_ID = -4031859798;
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
  "bubbles.png": "🫧",
  "dolphin.png": "🐬",
};

/**
 * POST /api/cardholder
 * Posts a pseudonymous chat message which is verified and broadcasted to the Telegram chat bot.
 * @param {object} request - The request object. Consists of the following parameters encoded as JSON.
 * @param {string} request.message - The message the user is posting.
 * @param {string} request.signature - The signature of the message.
 * @param {string} request.signature.r - The r value of the signature.
 * @param {string} request.signature.s - The s value of the signature.
 * @param {string} request.signature.v - The v value of the signature.
 * @returns A JSON response with a success boolean indicating if the chat message was posted.
 */
export async function POST(request: Request) {
  try {
    const bodyArrayBuffer = await request.arrayBuffer();
    const bodyString = new TextDecoder().decode(bodyArrayBuffer);
    const { message, signature } = JSON.parse(bodyString);
    const messageHash = hashMessage(message);

    const sig = `0x${signature.r}${signature.s}${signature.v.toString(16)}`;
    const publicKey = recoverPublicKey(messageHash, sig);
    console.log("Recovering public key: ", publicKey);
    if (!publicKey) {
      throw new Error("Could not recover public key from signature.");
    }

    const sigmoji = getSigmojiFromPublicKey(publicKey);
    console.log("Sigmoji: ", sigmoji);
    if (!sigmoji) {
      throw new Error("Signature does not correspond to any card.");
    }

    const emoji = emojiMap[sigmoji];
    const fullMessage = `Cardholder of ${emoji}: ${message}`;
    telegramBot.telegram.sendMessage(TELEGRAM_TEST_CHAT_ID, fullMessage);

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
 * Gets the Sigmoji corresponding to a public key. Returns undefined if the public key is not found.
 * Currently returns the Sigmoji's emojiImg.
 * @param publicKey - The public key to get the Sigmoji for.
 * @returns The emojiImg corresponding to the public key or undefined if the public key is not found.
 */
function getSigmojiFromPublicKey(publicKey: string): string | undefined {
  for (const cardPubKey of Object.values(cardPubKeys)) {
    if (cardPubKey.primaryPublicKeyRaw === publicKey) {
      return cardPubKey.image;
    }
  }

  return;
}
