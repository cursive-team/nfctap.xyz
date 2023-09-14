import {
  Sigmoji,
  BackupState,
  serializeSigmoji,
  deserializeSigmoji,
  serializeBackupState,
  deserializeBackupState,
} from "./types";

/**
 * Checks if the storage is empty.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the storage is empty.
 */
export async function isStorageEmpty(): Promise<boolean> {
  const sigmojis = await loadSigmojis();
  return sigmojis.length === 0;
}

/**
 * Parses a serialized string of Sigmojis.
 * @param {string} serializedStr - The serialized string to parse.
 * @returns {Promise<Sigmoji[]>} - A promise that resolves to an array of Sigmojis.
 */
export async function parseSerializedSigmoji(
  serializedStr: string
): Promise<Sigmoji[]> {
  if (serializedStr != null && serializedStr !== "") {
    const serializedSigmojis = JSON.parse(serializedStr);
    return await Promise.all(
      serializedSigmojis.map((serializedSigmoji: string) =>
        deserializeSigmoji(serializedSigmoji)
      )
    );
  }

  return [];
}

/**
 * Loads Sigmojis from the local storage.
 * @returns {Promise<Sigmoji[]>} - A promise that resolves to an array of Sigmojis.
 */
export async function loadSigmojis(): Promise<Sigmoji[]> {
  const sigmojis = window.localStorage["sigmojis"];
  return await parseSerializedSigmoji(sigmojis);
}

/**
 * Loads the Sigmojis from localStorage to be stored in a wallet backup. However,
 * we remove any computed ZKP as that would be too large to store in the wallet
 * backup. We then returned a serialized version of this new array.
 * @returns {Promise<string>} - A promise that resolves to a serialized string of Sigmojis.
 */
export async function loadSigmojiWalletBackup(): Promise<string> {
  const sigmojis = await loadSigmojis();
  const sigmojisWithoutZKP = sigmojis.map((sigmoji) => {
    return {
      emojiImg: sigmoji.emojiImg,
      PCD: sigmoji.PCD,
      ZKP: "",
    };
  });
  return JSON.stringify(
    await Promise.all(sigmojisWithoutZKP.map(serializeSigmoji))
  );
}

/**
 * Saves a Sigmoji to the local storage.
 * @param {Sigmoji} sigmoji - The Sigmoji to save.
 */
export async function saveSigmoji(sigmoji: Sigmoji): Promise<void> {
  const sigmojis = await loadSigmojis();
  sigmojis.push(sigmoji);
  window.localStorage["sigmojis"] = JSON.stringify(
    await Promise.all(sigmojis.map(serializeSigmoji))
  );
}

/**
 * Updates a Sigmoji in the localStorage.
 * @param {Sigmoji} sigmoji - The Sigmoji to update.
 */
export async function updateSigmoji(sigmoji: Sigmoji): Promise<void> {
  const sigmojis = await loadSigmojis();
  const index = sigmojis.findIndex((s) => s.emojiImg === sigmoji.emojiImg);
  if (index !== -1) {
    sigmojis[index] = sigmoji;
  }
  window.localStorage["sigmojis"] = JSON.stringify(
    await Promise.all(sigmojis.map(serializeSigmoji))
  );
}

/**
 * Loads the backup state from localStorage.
 * @returns {Promise<BackupState | undefined>} - A promise that resolves to the backup state or undefined if it doesn't exist.
 */
export async function loadBackupState(): Promise<BackupState | undefined> {
  const serializedBackup = window.localStorage["backup"];
  if (serializedBackup != null && serializedBackup !== "") {
    return deserializeBackupState(serializedBackup);
  }
  return undefined;
}

/**
 * Saves the backup state to localStorage.
 * @param {BackupState} backup - The backup state to save.
 */
export async function saveBackupState(backup: BackupState): Promise<void> {
  window.localStorage["backup"] = serializeBackupState(backup);
}
