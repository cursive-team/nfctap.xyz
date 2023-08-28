"use client";

import {
  ModalBackground,
  ModalContainer,
  ModalDiv,
  ModalHeader,
} from "../shared/Modal";
import { PrimaryFontBase, PrimaryFontH3 } from "../core";
import styled from "styled-components";
import { execHaloCmdWeb } from "@arx-research/libhalo/api/web.js";
import { recoverPublicKey } from "@arx-research/libhalo/halo/utils.js";
import { useEffect, useState } from "react";
import { sha256 } from "js-sha256";
import { HaLoNoncePCDArgs, HaLoNoncePCDPackage } from "@pcd/halo-nonce-pcd";
import { ArgumentTypeName } from "@pcd/pcd-types";
import CollectedModal from "./CollectedModal";

export default function TapModal() {
  const [statusText, setStatusText] = useState("Waiting for NFC setup...");
  const [args, setArgs] = useState<HaLoNoncePCDArgs | undefined>(undefined);

  // run code as soon as modal is rendered
  useEffect(() => {
    async function runScan() {
      let command = {
        name: "sign_random",
        keyNo: 2,
      };

      let res;
      try {
        // --- request NFC command execution ---
        res = await execHaloCmdWeb(command, {
          statusCallback: (cause: any) => {
            if (cause === "init") {
              setStatusText(
                "Please tap the tag to the back of your smartphone and hold it..."
              );
            } else if (cause === "retry") {
              setStatusText(
                "Something went wrong, please try to tap the tag again..."
              );
            } else if (cause === "scanned") {
              setStatusText(
                "Tag scanned successfully, post-processing the result..."
              );
            } else {
              setStatusText(cause);
            }
          },
        });
        // the command has succeeded, display the result to the user
        setStatusText(res.nonce + "/n" + res.digest + "/n" + res.signature);

        // parsing DER
        const rndBuf = Buffer.from(res.digest, "hex");
        const hash = sha256.create();
        const rndHashed = hash
          .update(
            Buffer.concat([
              Buffer.from([0x19]),
              Buffer.from("Attest counter pk2:\n", "utf8"),
            ])
          )
          .update(rndBuf)
          .hex();

        const sigmojiPubkey = recoverPublicKey(rndHashed, res.signature);

        setArgs({
          pk2: {
            argumentType: ArgumentTypeName.String,
            value: sigmojiPubkey[1],
          },
          rnd: {
            argumentType: ArgumentTypeName.String,
            value: res.digest,
          },
          rndsig: {
            argumentType: ArgumentTypeName.String,
            value: res.signature,
          },
        });
      } catch (e) {
        // the command has failed, display error to the user
        setStatusText(
          "Scanning failed, reload to retry. Details: " + String(e)
        );
      }
    }

    runScan();
  }, []);

  return args ? (
    <CollectedModal args={args} />
  ) : (
    <ModalBackground>
      <ModalContainer>
        <ModalDiv>
          <ModalHeader />
          <OuterContainer>
            <InnerContainer>
              <PrimaryFontH3 style={{ color: "var(--woodsmoke-100)" }}>
                Tap the NFC card on your phone.
              </PrimaryFontH3>
              <PrimaryFontBase style={{ color: "var(--woodsmoke-100)" }}>
                {statusText}
              </PrimaryFontBase>
              <PrimaryFontBase style={{ color: "var(--woodsmoke-100)" }}>
                If nothing happens, check out the{" "}
                <a
                  href="https://pse-team.notion.site/Card-tapping-instructions-ac5cae2f72e34155ba67d8a251b2857c?pvs=4"
                  target="_blank"
                  style={{ textDecoration: "underline" }}
                >
                  troubleshooting guide
                </a>
                .
              </PrimaryFontBase>
            </InnerContainer>
          </OuterContainer>
          <img
            src="/phone-tap.gif"
            style={{ marginTop: "40px", marginBottom: "40px" }}
          />
        </ModalDiv>
      </ModalContainer>
    </ModalBackground>
  );
}

const OuterContainer = styled.div`
  display: flex;
  padding: 0px 8px;
`;

const InnerContainer = styled.div`
  display: flex;
  max-width: 264px;
  flex-direction: column;
  text-align: center;
  align-items: center;
  gap: 24px;
  flex: 1 0 0;
`;
