import { TextArea } from "@/components/shared/TextArea";
import { CourierPrimeBase, PrimaryFontBase } from "@/components/core";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Sigmoji } from "@/lib/types";
import { addZKPToSigmoji, setupTree } from "@/lib/zkProving";
import { useSigmojis } from "@/hooks/useSigmojis";
import { useWasm } from "@/hooks/useWasm";
import { Button } from "../ui/button";
import Modal from "./Modal";
import { Dropdown, DropdownProps } from "../ui/dropdown";

enum ChatDisplayState {
  LOADING,
  READY,
  PROVING,
  SUBMITTING,
}

export default function ChatModal() {
  const { data: { wasm } = {}, isLoading: isLoadingWasm } = useWasm();
  const { data: sigmojis = [], isLoading: isLoadingSigmojis } = useSigmojis();
  const [isDisabled, setDisabled] = useState(false);

  const [selectedSigmoji, setSelectedSigmoji] = useState<string>();
  const [message, setMessage] = useState("");
  const [displayState, setDisplayState] = useState<ChatDisplayState>(
    ChatDisplayState.READY
  );

  const isLoading = isLoadingWasm || isLoadingSigmojis;

  useEffect(() => {
    if (sigmojis?.length === 0) return;
    setSelectedSigmoji(sigmojis[0].emojiImg);
  }, [sigmojis]);

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

    let sigmoji = sigmojis.find(
      (sigmoji) => sigmoji.emojiImg === selectedSigmoji
    );
    if (!sigmoji) {
      alert("Invalid Sigmoji selected.");
      return;
    }

    setDisabled(true);

    if (!sigmoji.ZKP) {
      setDisplayState(ChatDisplayState.PROVING);
      sigmoji = await generateProofForSigmoji(sigmoji);
    }

    setDisplayState(ChatDisplayState.SUBMITTING);

    await fetch("/api/chat", {
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
    setDisabled(false);
  };

  const getDisplayText = () => {
    switch (displayState) {
      case ChatDisplayState.READY:
        return "SEND";
      case ChatDisplayState.PROVING:
        return "PROVING...";
      case ChatDisplayState.SUBMITTING:
        return "SENDING MESSAGE...";
    }
  };

  const sigmojisOptions: DropdownProps["items"] =
    sigmojis?.map(({ emojiImg }) => {
      return {
        content: (
          <Image
            src={`/emoji-photo/${emojiImg}`}
            width="24"
            height="24"
            alt="emoji"
            className="mx-auto"
          />
        ),
        onClick: () => onSelectSigmoji(emojiImg),
      };
    }) ?? [];

  return (
    <Modal
      title="Collector Chat"
      description="Chat as a collector of Sigmojis! Your message will be sent to the FtC residency TG group."
    >
      <div className="flex flex-col items-center self-stretch text-center gap-4 p-2">
        {selectedSigmoji && (
          <div className="flex flex-col gap-2 items-center">
            <Dropdown
              label={
                <>
                  <span>Select a Sigmoji to chat as:</span>
                  <Image
                    src={`/emoji-photo/${selectedSigmoji}`}
                    width="24"
                    height="24"
                    alt="emoji"
                  />
                </>
              }
              items={sigmojisOptions}
            />
          </div>
        )}
        <TextArea header="Message" value={message} setValue={setMessage} />
        <Button
          className="w-full"
          disabled={!wasm || isLoading || isDisabled}
          loading={isLoading}
          onClick={onSubmit}
        >
          {getDisplayText()}
        </Button>
      </div>
    </Modal>
  );
}
