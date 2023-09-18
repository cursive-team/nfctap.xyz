import { HaLoNoncePCD, serialize, deserialize } from "@pcd/halo-nonce-pcd";
import { PublicInput } from "@personaelabs/spartan-ecdsa";

export interface Sigmoji {
  emojiImg: string;

  /**
   * PCD storing the card's signature
   */
  PCD: HaLoNoncePCD;

  /**
   * Serialized ZKP.
   */
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
  // need to convert to Array for JSON.stringify
  return JSON.stringify({
    proof: Array.from(proof),
    publicInput: Array.from(publicInput.serialize()),
  });
}

export function deserializeSigmojiZKP(serializedZKP: string): {
  proof: Uint8Array;
  publicInputSer: Uint8Array;
} {
  const data = JSON.parse(serializedZKP);
  return {
    proof: new Uint8Array(data.proof),
    publicInputSer: new Uint8Array(data.publicInput),
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
