import styled from "styled-components";
import { MainHeader } from "@/components/shared/Headers";
import Footer from "@/components/shared/Footer";
import { TextArea } from "@/components/shared/TextArea";
import { PrimaryLargeButton } from "@/components/shared/Buttons";
import { CourierPrimeBase, PrimaryFontH1 } from "@/components/core";
import { useState } from "react";
import CardholderTapModal from "../modals/CardholderTapModal";

export type SignMessageArgs = {
  digest: string;
  rawSignature: {
    r: string;
    s: string;
    v: number;
  };
  publicKey: string;
};

enum CardholderDisplayState {
  CHAT,
  TAP,
  SUBMITTING,
}

export default function CardholderScreen() {
  const [message, setMessage] = useState("");
  const [displayState, setDisplayState] = useState<CardholderDisplayState>(
    CardholderDisplayState.CHAT
  );

  const onCardholderTap = async (args: SignMessageArgs): Promise<void> => {
    setDisplayState(CardholderDisplayState.SUBMITTING);
    await fetch("/api/cardholder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        signature: args.rawSignature,
      }),
    }).then(async (response) => {
      setMessage("");
      setDisplayState(CardholderDisplayState.CHAT);
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

  const onSubmit = async () => {
    if (!message) {
      alert("Please enter a message.");
      return;
    }

    setDisplayState(CardholderDisplayState.TAP);
  };

  const getDisplayText = () => {
    switch (displayState) {
      case CardholderDisplayState.CHAT:
        return "SEND";
      case CardholderDisplayState.TAP:
        return "TAP";
      case CardholderDisplayState.SUBMITTING:
        return "SENDING MESSAGE...";
    }
  };

  if (displayState === CardholderDisplayState.TAP) {
    return <CardholderTapModal message={message} onTap={onCardholderTap} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <ChatContainer>
        <PrimaryFontH1 style={{ color: "var(--woodsmoke-100)" }}>
          Cardholder Chat
        </PrimaryFontH1>
        <CourierPrimeBase style={{ maxWidth: "90%" }}>
          Chat pseudonymously with other Sigmoji holders! Messages will be sent
          to the Sigmoji Telegram group. This chat is only available to Sigmoji
          Cardholders.
        </CourierPrimeBase>
        <CourierPrimeBase style={{ color: "var(--woodsmoke-100)" }}>
          When you send a chat message, you will be asked to tap your card. This
          will generate a signature that authenticates your message.
        </CourierPrimeBase>
        <TextArea header="Message" value={message} setValue={setMessage} />
        <PrimaryLargeButton onClick={onSubmit}>
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
