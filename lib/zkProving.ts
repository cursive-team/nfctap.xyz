import {
  MembershipProver,
  MembershipVerifier,
  Tree,
  Poseidon,
  defaultPubkeyMembershipPConfig,
  defaultPubkeyMembershipVConfig,
} from "@personaelabs/spartan-ecdsa";
import { loadSigmojis } from "@/lib/localStorage";
import { cardPubKeys } from "./cardPubKeys";
import { importPublic, ecrecover } from "@ethereumjs/util";
import { sha256 } from "js-sha256";

function parseDERSignature(signature: string) {
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

function findV(r: string, s: string, messageHash: Buffer, publicKey: string) {
  console.log(publicKey);

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

    console.log(recoveredPublicKeyHex, publicKey);

    if (recoveredPublicKeyHex === publicKey) {
      return v;
    }
  }

  throw new Error("Failed to find correct v value");
}

export const makeProofs = async () => {
  const poseidon = new Poseidon();
  await poseidon.initWasm();
  const treeDepth = 20;
  const pubKeyTree = new Tree(treeDepth, poseidon);

  for (const entry of Object.entries(cardPubKeys)) {
    const secondaryPublicKeyRawUint8Array = new Uint8Array(
      (entry[1].secondaryPublicKeyRaw.match(/.{1,2}/g) || []).map((byte) =>
        parseInt(byte, 16)
      )
    );
    const pubKey = importPublic(secondaryPublicKeyRawUint8Array);
    const pubKeyBuffer = Buffer.from(pubKey);
    pubKeyTree.insert(poseidon.hashPubKey(pubKeyBuffer));
  }

  console.log(pubKeyTree);

  // load in localStorage
  const sigmojis = await loadSigmojis();

  // generate proofs for all the sigmojis
  for (const sigmoji of sigmojis) {
    if (sigmoji.ZKP === "") {
      // set up signature
      const { r, s } = parseDERSignature(sigmoji.PCD.proof.cleanedSignature);

      // setup pubkey + merkle proof
      const secondaryPublicKeyRawUint8Array = new Uint8Array(
        (sigmoji.PCD.claim.pubkeyHex.match(/.{1,2}/g) || []).map((byte) =>
          parseInt(byte, 16)
        )
      );
      const pubKey = importPublic(secondaryPublicKeyRawUint8Array);
      const pubKeyBuffer = Buffer.from(pubKey);
      const pubKeyHash = poseidon.hashPubKey(pubKeyBuffer);
      const index = pubKeyTree.indexOf(pubKeyHash);
      const merkleProof = pubKeyTree.createProof(index);

      // set up msgHash
      const rndBuf = Buffer.from(sigmoji.PCD.proof.signedDigest, "hex");
      const hash = sha256.create();
      const msgHash = Buffer.from(
        hash
          .update(
            Buffer.concat([
              Buffer.from([0x19]),
              Buffer.from("Attest counter pk2:\n", "utf8"),
            ])
          )
          .update(rndBuf)
          .hex()
      );

      const v = findV(r, s, msgHash, sigmoji.PCD.claim.pubkeyHex);
      const sig = `0x${r}${s}${v.toString(16)}`;

      console.log("Proving...");
      console.time("Full proving time");

      const prover = new MembershipProver({
        ...defaultPubkeyMembershipPConfig,
        enableProfiler: true,
      });

      await prover.initWasm();

      const { proof, publicInput } = await prover.prove(
        sig,
        msgHash,
        merkleProof
      );

      console.timeEnd("Full proving time");
      console.log(
        "Raw proof size (excluding public input)",
        proof.length,
        "bytes"
      );

      console.log("Verifying...");
      const verifier = new MembershipVerifier({
        ...defaultPubkeyMembershipVConfig,
        enableProfiler: true,
      });
      await verifier.initWasm();

      console.time("Verification time");
      const result = await verifier.verify(proof, publicInput.serialize());
      console.timeEnd("Verification time");

      if (result) {
        console.log("Successfully verified proof!");
      } else {
        console.log("Failed to verify proof :(");
      }

      break;
    }
  }
};
