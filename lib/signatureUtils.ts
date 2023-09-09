import { ecrecover } from "@ethereumjs/util";

export function parseDERSignature(signature: string) {
  const buf = Buffer.from(signature, "hex");

  if (buf[0] !== 0x30) {
    throw new Error("Invalid signature format");
  }

  let offset = 2;

  if (buf[offset] !== 0x02) {
    throw new Error("Invalid signature format");
  }
  offset += 1;

  const rLength = buf[offset];
  offset += 1;

  const r = buf.subarray(offset, offset + rLength).toString("hex");
  offset += rLength;

  if (buf[offset] !== 0x02) {
    throw new Error("Invalid signature format");
  }
  offset += 1;

  const sLength = buf[offset];
  offset += 1;

  const s = buf.subarray(offset, offset + sLength).toString("hex");

  return {
    r: r,
    s: s,
  };
}

export function findV(
  r: string,
  s: string,
  messageHash: Uint8Array,
  publicKey: string
) {
  for (let recid = 0; recid <= 1; recid++) {
    // Ethereum's 'v' is recid + 27
    const v = recid + 27;

    const recoveredPublicKey = ecrecover(
      messageHash,
      BigInt(v),
      Buffer.from(r, "hex"),
      Buffer.from(s, "hex")
    );

    const recoveredPublicKeyHex =
      Buffer.from(recoveredPublicKey).toString("hex");

    if (
      recoveredPublicKeyHex.toLowerCase() === publicKey.slice(2).toLowerCase()
    ) {
      return v;
    }
  }

  throw new Error("Failed to find correct v value");
}
