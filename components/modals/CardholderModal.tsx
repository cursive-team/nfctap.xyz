import { TextArea } from "@/components/shared/TextArea";
import { useState } from "react";
import CardholderTapModal from "./CardholderTapModal";
import Modal from "./Modal";
import { Button } from "../ui/button";

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

export default function CardholderModal() {
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
    <Modal
      title="Cardholder Chat"
      description={
        <>
          <span>
            Chat as a Sigmoji cardholder! Your message will be sent to the{" "}
            <a href="https://t.me/c/1963446787/1414">
              <b>
                <u>FtC residency TG group</u>
              </b>
            </a>
            .
          </span>
          <span>
            When you send a chat message, you will be prompted tap your card.
            This will generate a signature to authenticate your message.
          </span>
        </>
      }
    >
      <div className="flex flex-col items-center self-stretch text-center gap-4 p-2">
        <TextArea header="Message" value={message} setValue={setMessage} />
        <Button className="w-full" onClick={onSubmit}>
          {getDisplayText()}
        </Button>
      </div>
    </Modal>
  );
}
