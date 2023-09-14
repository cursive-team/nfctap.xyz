import {
  loadBackupState,
  loadSigmojis,
  saveBackupState,
  loadSigmojiWalletBackup,
} from "@/lib/localStorage";
import Image from "next/image";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const AppleWalletButton = () => {
  const [serial, setSerial] = useState<string | undefined>(undefined);
  const [number, setNumber] = useState<number | undefined>(undefined);
  const [sigmojiWalletBackup, setSigmojiWalletBackup] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    loadSigmojis().then((sigmojis) => {
      setNumber(sigmojis.length);
    });
    loadSigmojiWalletBackup().then((serializedSigmojis) => {
      setSigmojiWalletBackup(serializedSigmojis);
    });
    loadBackupState().then((backup) => {
      if (backup !== undefined && backup.type === "apple") {
        setSerial(backup.serialNum);
      } else {
        setSerial(uuidv4());
      }
    });
  });

  return (
    <div className="flex justify-center">
      <button
        style={{ margin: 0 }}
        onClick={() => {
          if (number && serial && sigmojiWalletBackup) {
            saveBackupState({
              type: "apple",
              serialNum: serial,
            });
            window.location.href = `/api/generateApplePass?number=${number}&serial=${serial}&collection=${sigmojiWalletBackup}`;
          }
        }}
        disabled={!(number && serial)}
      >
        <Image
          src="/buttons/AddToAppleWallet.svg"
          alt="Add to Apple Wallet"
          width={201}
          height={42}
          sizes="100vw"
          style={number && serial ? {} : { filter: "grayscale(100%)" }}
        />
      </button>
    </div>
  );
};
