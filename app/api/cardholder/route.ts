import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Telegraf } from "telegraf";
import { cardPubKeys } from "@/lib/cardPubKeys";
import { recoverPublicKey } from "ethers/lib/utils";
import { hashMessage } from "@/lib/signatureUtils";

const telegramBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
// This is super jank. List of pairs of (chatId, threadId) to send messages to.
const TELEGRAM_TEST_CHAT_IDS = [
  [-4031859798, undefined],
  [-1001963446787, 1414],
];
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
    if (!publicKey) {
      throw new Error("Could not recover public key from signature.");
    }

    // Remove the 0x prefix from the public key
    const sigmoji = getSigmojiFromPublicKey(publicKey.slice(2));
    if (!sigmoji) {
      throw new Error("Signature does not correspond to any card.");
    }

    const emoji = emojiMap[sigmoji];
    const fullMessage = `Cardholder of ${emoji}: ${message}`;
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

    await addCardholderChatLog({ message, sigmoji });

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

/**
 * Adds a new entry to the chat log.
 * @param logEntry - The entry to add.
 * @param logEntry.message - The message that was sent.
 * @param logEntry.sigmoji - The Sigmoji the user is a cardholder of. Currently represents the emojiImg of the Sigmoji.
 */
async function addCardholderChatLog(logEntry: {
  message: string;
  sigmoji: string;
}) {
  try {
    const newEntry = await prisma.chatLog.create({
      data: { ...logEntry, isCardholderChat: true },
    });
    console.log("New chat log entry:", newEntry);
  } catch (error) {
    console.error("Error adding chat log entry:", error);
  }
}
