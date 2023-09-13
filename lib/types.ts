import { HaLoNoncePCD, serialize, deserialize } from "@pcd/halo-nonce-pcd";
import { PublicInput } from "@personaelabs/spartan-ecdsa";

export interface Sigmoji {
  emojiImg: string;
  PCD: HaLoNoncePCD;
  ZKP: string;
}

export async function serializeSigmoji(sigmoji: Sigmoji): Promise<string> {
  const serializedPCD = await serialize(sigmoji.PCD);

  return JSON.stringify({
    emojiImg: sigmoji.emojiImg,
    stringPCD: serializedPCD.pcd,
    ZKP: sigmoji.ZKP,
  });
}

export async function deserializeSigmoji(
  serializedSigmoji: string
): Promise<Sigmoji> {
  const data = JSON.parse(serializedSigmoji);
  return {
    emojiImg: data.emojiImg,
    PCD: await deserialize(data.stringPCD),
    ZKP: data.ZKP,
  };
}

export function serializeSigmojiZKP(
  proof: Uint8Array,
  publicInput: PublicInput
): string {
  return JSON.stringify({
    proof: proof,
    publicInput: publicInput.serialize(),
  });
}

export function deserializeSigmojiZKP(serializedZKP: string): {
  proof: Uint8Array;
  publicInput: PublicInput;
} {
  const data = JSON.parse(serializedZKP);
  return {
    proof: data.proof,
    publicInput: PublicInput.deserialize(data.publicInput),
  };
}

export interface BackupState {
  type: "google" | "apple" | "copypaste" | "none";
  serialNum: string;
}

export function serializeBackupState(backup: BackupState): string {
  return JSON.stringify(backup);
}

export function deserializeBackupState(serializedBackup: string): BackupState {
  return JSON.parse(serializedBackup);
}
