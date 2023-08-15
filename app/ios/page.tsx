import { isIOS } from "react-device-detect";

export default function IosPage() {
  return (
    <div>
      Hi, this is a page.
      <div>
        {!isIOS ? (
          <a href="vinyl.pkpass">Add to apple wallet.</a>
        ) : (
          <div>You are not on an iOS device.</div>
        )}
      </div>
    </div>
  );
}
