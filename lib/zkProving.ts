import {
  MembershipProver,
  Tree,
  Poseidon,
  defaultPubkeyMembershipPConfig,
} from "@personaelabs/spartan-ecdsa";
import { loadSigmojis, updateSigmoji } from "@/lib/localStorage";
import { cardPubKeys } from "./cardPubKeys";
import { importPublic } from "@ethereumjs/util";
import { sha256 } from "js-sha256";
import { serializeSigmojiZKP } from "@/lib/types";
import {
  parseDERSignature,
  findV,
  hexToUint8Array,
} from "@/lib/signatureUtils";

export interface ProverWasm {
  poseidon: Poseidon;
  prover: MembershipProver;
}

export async function initWasm(): Promise<ProverWasm> {
  const poseidon = new Poseidon();
  await poseidon.initWasm();

  const prover = new MembershipProver({
    ...defaultPubkeyMembershipPConfig,
    enableProfiler: true,
  });

  await prover.initWasm();

  return { poseidon, prover };
}

export const makeProofs = async (proverWasm: ProverWasm) => {
  const treeDepth = 20;
  const pubKeyTree = new Tree(treeDepth, proverWasm.poseidon);

  for (const entry of Object.entries(cardPubKeys)) {
    const secondaryPublicKeyRawUint8Array = hexToUint8Array(
      entry[1].secondaryPublicKeyRaw
    );
    const pubKey = importPublic(secondaryPublicKeyRawUint8Array);
    const pubKeyBuffer = Buffer.from(pubKey);
    pubKeyTree.insert(proverWasm.poseidon.hashPubKey(pubKeyBuffer));
  }

  console.log(pubKeyTree);

  // load in localStorage
  const sigmojis = await loadSigmojis();

  // generate proofs for all the sigmojis
  for (const sigmoji of sigmojis) {
    if (sigmoji.ZKP === "") {
      // set up signature
      let { r, s } = parseDERSignature(sigmoji.PCD.proof.cleanedSignature);

      // remove 00 at start of r, s if present
      if (r.length == 66) {
        r = r.slice(2);
      }
      if (s.length == 66) {
        s = s.slice(2);
      }

      // setup pubkey + merkle proof
      const secondaryPublicKeyRawUint8Array = hexToUint8Array(
        sigmoji.PCD.claim.pubkeyHex
      );
      const pubKey = importPublic(secondaryPublicKeyRawUint8Array);
      const pubKeyBuffer = Buffer.from(pubKey);
      const pubKeyHash = proverWasm.poseidon.hashPubKey(pubKeyBuffer);
      const index = pubKeyTree.indexOf(pubKeyHash);
      const merkleProof = pubKeyTree.createProof(index);

      // set up msgHashArray
      const rndBuf = Buffer.from(sigmoji.PCD.proof.signedDigest, "hex");
      const hash = sha256.create();
      const msgHash = hash
        .update(
          Buffer.concat([
            Buffer.from([0x19]),
            Buffer.from("Attest counter pk2:\n", "utf8"),
          ])
        )
        .update(rndBuf)
        .hex();
      const msgHashArray = hexToUint8Array(msgHash);

      const v = findV(
        r,
        s,
        Buffer.from(msgHashArray),
        sigmoji.PCD.claim.pubkeyHex
      );
      const sig = `0x${r}${s}${v.toString(16)}`;

      console.log("Proving...");
      console.time("Full proving time");
      const { proof, publicInput } = await proverWasm.prover.prove(
        sig,
        Buffer.from(msgHashArray),
        merkleProof
      );
      console.timeEnd("Full proving time");

      // save proof in localStorage
      sigmoji.ZKP = serializeSigmojiZKP(proof, publicInput);
      await updateSigmoji(sigmoji);
    }
  }
};
