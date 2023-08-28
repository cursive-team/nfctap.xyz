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
import { importPublic } from "@ethereumjs/util";
import { sha256 } from "js-sha256";

function parseDERSignature(signature: string) {
  // Get the length of the signature
  var len = signature.length;
  console.log(signature);
  console.log(len);

  // Check if the signature is the correct length
  if (len !== 65) {
    throw new Error("The signature is not the correct length");
  }

  // Get the first byte of the signature
  var firstByte = signature.charCodeAt(0);

  // Check if the first byte is the correct value
  if (firstByte !== 0x30) {
    throw new Error("The signature is not a DER-encoded ECDSA signature");
  }

  // Get the second byte of the signature
  var secondByte = signature.charCodeAt(1);

  // Get the length of the r value
  var rLength = secondByte & 0x7f;

  // Get the r value
  var r = signature.slice(2, 2 + rLength);

  // Get the third byte of the signature
  var thirdByte = signature.charCodeAt(2 + rLength);

  // Get the length of the s value
  var sLength = thirdByte & 0x7f;

  // Get the s value
  var s = signature.slice(2 + rLength + 1, 2 + rLength + 1 + sLength);

  // Return the v, r, and s values
  return {
    v: firstByte & 0x0f,
    r: r,
    s: s,
  };
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
      const { v, r, s } = parseDERSignature(sigmoji.PCD.proof.cleanedSignature);
      const sig = `0x${r}${s}${v.toString(16)}`;

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

      console.log("merkle proof", merkleProof);

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
