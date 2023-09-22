import styled from "styled-components";
import { MainHeader } from "@/components/shared/Headers";
import Footer from "@/components/shared/Footer";
import { TextArea } from "@/components/shared/TextArea";
import { PrimaryLargeButton } from "@/components/shared/Buttons";
import { CourierPrimeBase, PrimaryFontH1 } from "@/components/core";
import { useEffect, useState } from "react";
import { Sigmoji } from "@/lib/types";
import { loadSigmojis } from "@/lib/localStorage";
import {
  ProverWasm,
  addZKPToSigmoji,
  initWasm,
  setupTree,
} from "@/lib/zkProving";
import { Input } from "../shared/Input";

enum ChatDisplayState {
  LOADING,
  READY,
  PROVING,
  SUBMITTING,
}

export default function ChatScreen() {
  const [wasm, setWasm] = useState<ProverWasm>();
  const [pseudonym, setPseudonym] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [displayState, setDisplayState] = useState<ChatDisplayState>(
    ChatDisplayState.LOADING
  );

  useEffect(() => {
    async function setup() {
      if (!wasm) {
        setWasm(await initWasm());
      }
    }

    setup();
  }, [wasm]);

  useEffect(() => {
    if (wasm) {
      setDisplayState(ChatDisplayState.READY);
    }
  }, [wasm]);

  const generateProofForSigmoji = async (
    sigmoji: Sigmoji
  ): Promise<Sigmoji> => {
    if (!wasm) throw new Error("WASM not initialized");

    if (sigmoji.ZKP) {
      return sigmoji;
    }

    const pubKeyTree = setupTree(wasm);
    return addZKPToSigmoji(sigmoji, wasm, pubKeyTree);
  };

  const onSubmit = async () => {
    if (!pseudonym) {
      alert("Please select a pseudonym.");
      return;
    }

    if (!message) {
      alert("Please enter a message.");
      return;
    }

    const sigmojiArr = await loadSigmojis();
    if (sigmojiArr.length === 0) {
      alert("You must have a Sigmoji to use this chat.");
      return;
    }

    // Just use the first sigmoji for now
    let sigmoji = sigmojiArr[0];
    if (!sigmoji.ZKP) {
      setDisplayState(ChatDisplayState.PROVING);
      sigmoji = await generateProofForSigmoji(sigmoji);
    }

    setDisplayState(ChatDisplayState.SUBMITTING);
    await fetch("/api/anon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pseudonym: pseudonym,
        message: message,
        serializedZKP: sigmoji.ZKP,
      }),
    }).then(async (response) => {
      setMessage("");
      setDisplayState(ChatDisplayState.READY);
      if (response.status === 200) {
        alert("Successfully sent chat message!");
      } else {
        const data = await response.json();
        if (data.error) {
          console.error(data.error);
        }
        alert("Error sending chat message.");
      }
    });
  };

  const getDisplayText = () => {
    switch (displayState) {
      case ChatDisplayState.LOADING:
        return "LOADING...";
      case ChatDisplayState.READY:
        return "SEND";
      case ChatDisplayState.PROVING:
        return "PROVING...";
      case ChatDisplayState.SUBMITTING:
        return "SENDING MESSAGE...";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <ChatContainer>
        <PrimaryFontH1 style={{ color: "var(--woodsmoke-100)" }}>
          Anon Chat
        </PrimaryFontH1>
        <CourierPrimeBase style={{ maxWidth: "90%" }}>
          Chat pseudonymously with other Sigmoji holders! Messages will be sent
          to the Sigmoji Telegram group.
        </CourierPrimeBase>
        <CourierPrimeBase style={{ maxWidth: "90%" }}>
          You will only be defined by the pseudonym you select, but you must
          have a Sigmoji to use this chat.
        </CourierPrimeBase>
        <Input header="Pseudonym" value={pseudonym} setValue={setPseudonym} />
        <TextArea header="Message" value={message} setValue={setMessage} />
        <PrimaryLargeButton disabled={!wasm} onClick={onSubmit}>
          {getDisplayText()}
        </PrimaryLargeButton>
      </ChatContainer>
      <div style={{ marginTop: "auto" }}>
        <Footer />
      </div>
    </div>
  );
}

const ChatContainer = styled.div`
  display: flex;
  gap: 16px;
  padding: 8px;
  flex-direction: column;
  text-align: center;
  align-items: center;
  align-self: stretch;
`;
