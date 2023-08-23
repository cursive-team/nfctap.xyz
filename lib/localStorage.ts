import {
  Sigmoji,
  BackupState,
  serializeSigmoji,
  deserializeSigmoji,
  serializeBackupState,
  deserializeBackupState,
} from "./types";

export async function isStorageEmpty(): Promise<boolean> {
  const sigmojis = await loadSigmojis();
  return sigmojis.length === 0;
}

export async function loadSigmojis(): Promise<Sigmoji[]> {
  const sigmojis = window.localStorage["sigmojis"];
  if (sigmojis != null && sigmojis !== "") {
    const serializedSigmojis = JSON.parse(sigmojis);
    return await Promise.all(
      serializedSigmojis.map((serializedSigmoji: string) =>
        deserializeSigmoji(serializedSigmoji)
      )
    );
  }
  return [];
}

export async function saveSigmoji(sigmoji: Sigmoji): Promise<void> {
  const sigmojis = await loadSigmojis();
  sigmojis.push(sigmoji);
  window.localStorage["sigmojis"] = JSON.stringify(
    await Promise.all(sigmojis.map(serializeSigmoji))
  );
}

export async function loadBackupState(): Promise<BackupState | undefined> {
  const serializedBackup = window.localStorage["backup"];
  if (serializedBackup != null && serializedBackup !== "") {
    return deserializeBackupState(serializedBackup);
  }
  return undefined;
}

export async function saveBackupState(backup: BackupState): Promise<void> {
  window.localStorage["backup"] = serializeBackupState(backup);
}
