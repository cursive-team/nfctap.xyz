import { POST } from "@/app/api/chat/route";
import { GET } from "@/app/api/generateApplePass/route";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const provingTimeString = (duration: number): string => {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor(duration / (1000 * 60 * 60));

  let timeString = `${seconds}s`;
  if (minutes > 0 || hours > 0) {
    timeString = `${minutes}m ${timeString}`;
  }
  if (hours > 0) {
    timeString = `${hours}h ${timeString}`;
  }

  return timeString;
};