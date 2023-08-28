import {
  loadBackupState,
  loadSigmojis,
  saveBackupState,
} from "@/lib/localStorage";
import { BackupState, Sigmoji } from "@/lib/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const AppleWalletButton = () => {
  const [sigmojis, setSigmojis] = useState<Sigmoji[] | undefined>(undefined);
  const [serial, setSerial] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadSigmojis().then((sigmojis) => {
      setSigmojis(sigmojis);
    });
    loadBackupState().then((backup) => {
      if (backup !== undefined && backup.type === "apple") {
        setSerial(backup.serialNum);
      } else {
        const backup: BackupState = {
          type: "apple",
          serialNum: uuidv4(),
        };
        saveBackupState(backup);
        setSerial(backup.serialNum);
      }
    });
  });

  return (
    <div className="flex justify-center">
      <a
        style={{ margin: 0 }}
        href={
          sigmojis && serial
            ? `api/generateApplePass?number=${sigmojis.length.toString()}` +
              `&serial=${serial}`
            : "#"
        }
      >
        <Image
          src="/buttons/AddToAppleWallet.svg"
          alt="Add to Apple Wallet"
          width={201}
          height={42}
          sizes="100vw"
          style={sigmojis ? {} : { filter: "grayscale(100%)" }}
        />
      </a>
    </div>
  );
};
