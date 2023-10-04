import { TextArea } from "../ui/textarea";
import { useState } from "react";
import CardholderTapModal from "./CardholderTapModal";
import Modal from "./Modal";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";

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

interface FormProps {
  message: string;
}

export default function CardholderModal() {
  const [displayState, setDisplayState] = useState<CardholderDisplayState>(
    CardholderDisplayState.CHAT
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormProps>();

  const message = watch("message", '');

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
      setValue("message", "");
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center self-stretch text-center gap-8 p-2"
      >
        <TextArea
          label="Message"
          error={errors?.message?.message}
          {...register("message", {
            required: {
              value: true,
              message: "Please enter a message.",
            },
          })}
        />
        <Button className="w-full" type="submit">
          {getDisplayText()}
        </Button>
      </form>
    </Modal>
  );
}
