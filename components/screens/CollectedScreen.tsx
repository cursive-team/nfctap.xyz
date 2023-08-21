import { SecondaryHeader } from "@/components/shared/SecondaryHeader";
import { AppleWalletButton } from "../wallet/AppleWalletButton";
import { GoogleWalletButton } from "../wallet/GoogleWalletButton";

export default function CollectedScreen() {
  return (
    <>
      <SecondaryHeader close={true} />
      <AppleWalletButton />
      <GoogleWalletButton />
    </>
  );
}
