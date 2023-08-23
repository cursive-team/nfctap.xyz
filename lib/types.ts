import { HaLoNoncePCD, serialize, deserialize } from "@pcd/halo-nonce-pcd";

export interface Sigmoji {
  pubkey: string;
  emoji: string;
  PCD: HaLoNoncePCD;
  ZKP: string;
}

export async function serializeSigmoji(sigmoji: Sigmoji): Promise<string> {
  const serializedPCD = await serialize(sigmoji.PCD);

  return JSON.stringify({
    pubkey: sigmoji.pubkey,
    emoji: sigmoji.emoji,
    stringPCD: serializedPCD.pcd,
    ZKP: sigmoji.ZKP,
  });
}

export async function deserializeSigmoji(
  serializedSigmoji: string
): Promise<Sigmoji> {
  const data = JSON.parse(serializedSigmoji);
  return {
    pubkey: data.pubkey,
    emoji: data.emoji,
    PCD: await deserialize(data.stringPCD),
    ZKP: data.ZKP,
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
