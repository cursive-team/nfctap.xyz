import styled from "styled-components";
import { MainHeader } from "@/components/shared/Headers";
import Footer from "@/components/shared/Footer";
import { TextArea } from "@/components/shared/TextArea";
import { PrimaryLargeButton } from "@/components/shared/Buttons";
import { CourierPrimeBase, PrimaryFontH1 } from "@/components/core";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Sigmoji } from "@/lib/types";
import { loadSigmojis } from "@/lib/localStorage";
import {
  ProverWasm,
  addZKPToSigmoji,
  initWasm,
  setupTree,
} from "@/lib/zkProving";

enum ChatDisplayState {
  LOADING,
  READY,
  PROVING,
  SUBMITTING,
}

export default function ChatScreen() {
  const [wasm, setWasm] = useState<ProverWasm>();
  const [sigmojiArr, setSigmojiArr] = useState<Sigmoji[]>([]);
  const [selectedSigmoji, setSelectedSigmoji] = useState<string>();
  const [message, setMessage] = useState("");
  const [displayState, setDisplayState] = useState<ChatDisplayState>(
    ChatDisplayState.LOADING
  );

  useEffect(() => {
    async function setup() {
      if (!wasm) {
        setWasm(await initWasm());
      }

      const arr = await loadSigmojis();
      setSigmojiArr(arr);

      if (arr.length > 0) {
        setSelectedSigmoji(arr[0].emojiImg);
      }
    }

    setup();
  }, [wasm]);

  useEffect(() => {
    if (wasm) {
      setDisplayState(ChatDisplayState.READY);
    }
  }, [wasm]);

  const onSelectSigmoji = (emojiImg: string) => {
    setSelectedSigmoji(emojiImg);
  };

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
    if (!message) {
      alert("Please enter a message.");
      return;
    }

    let sigmoji = sigmojiArr.find(
      (sigmoji) => sigmoji.emojiImg === selectedSigmoji
    );
    if (!sigmoji) {
      alert("Invalid Sigmoji selected.");
      return;
    }

    if (!sigmoji.ZKP) {
      setDisplayState(ChatDisplayState.PROVING);
      sigmoji = await generateProofForSigmoji(sigmoji);
    }

    setDisplayState(ChatDisplayState.SUBMITTING);
    await fetch("/api/telegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        sigmoji: sigmoji.emojiImg,
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
          Chat
        </PrimaryFontH1>
        <CourierPrimeBase style={{ maxWidth: "90%" }}>
          Chat pseudonymously with other Sigmoji holders! Messages will be sent
          to the Sigmoji Telegram group.
        </CourierPrimeBase>
        {selectedSigmoji && (
          <SelectionContainer>
            <CourierPrimeBase style={{ color: "var(--woodsmoke-100)" }}>
              Select a Sigmoji to chat as:
            </CourierPrimeBase>
            <SigmojiContainer>
              {sigmojiArr.map((sigmoji, index) => (
                <button
                  key={index}
                  onClick={() => onSelectSigmoji(sigmoji.emojiImg)}
                >
                  <Image
                    src={`/emoji-photo/${sigmoji.emojiImg}`}
                    width="24"
                    height="24"
                    alt="emoji"
                  />
                </button>
              ))}
            </SigmojiContainer>
            <CurrentSelectionContainer>
              <CourierPrimeBase style={{ color: "var(--woodsmoke-100)" }}>
                You are currently chatting as:
              </CourierPrimeBase>
              <Image
                src={`/emoji-photo/${selectedSigmoji}`}
                width="24"
                height="24"
                alt="emoji"
              />
            </CurrentSelectionContainer>
          </SelectionContainer>
        )}
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

const SelectionContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
  align-items: center;
`;

const SigmojiContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: row;
  align-items: center;
`;

const CurrentSelectionContainer = styled.div`
  display: flex;
  gap: 4px;
  flex-direction: row;
  align-items: center;
`;
