import { TextArea } from "../ui/textarea";
import { useEffect, useState } from "react";
import { Sigmoji } from "@/lib/types";
import { loadSigmojis } from "@/lib/localStorage";
import { addZKPToSigmoji } from "@/lib/zkProving";
import { useWasm } from "@/hooks/useWasm";
import Modal from "../modals/Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

enum ChatDisplayState {
  LOADING,
  READY,
  PROVING,
  SUBMITTING,
}

export default function AnonChatModal() {
  const [pseudonym, setPseudonym] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [displayState, setDisplayState] = useState<ChatDisplayState>(
    ChatDisplayState.LOADING
  );
  const [disabled, setDisabled] = useState(false);

  const { data: { wasm, pubKeyTree } = {}, isLoading: isLoadingWasm } =
    useWasm();

  useEffect(() => {
    if (wasm) {
      setDisplayState(ChatDisplayState.READY);
    }
  }, [wasm]);

  const generateProofForSigmoji = async (
    sigmoji: Sigmoji
  ): Promise<Sigmoji> => {
    if (!wasm || !pubKeyTree) throw new Error("WASM not initialized");

    if (sigmoji.ZKP) {
      return sigmoji;
    }

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

    setDisabled(true);

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
    setDisabled(false);
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
    <Modal
      title="Anon Chat"
      description={
        <>
          <span>
            Chat pseudonymously with other Sigmoji holders! You must have a
            Sigmoji to use this chat. Your message will be sent to the{" "}
            <a href="https://t.me/c/1963446787/1414">
              <b>
                <u>FtC residency TG group</u>
              </b>
            </a>
            .
          </span>
        </>
      }
    >
      <div className="flex flex-col items-center self-stretch text-center gap-4 p-2">
        <Input label="Pseudonym" value={pseudonym} onChange={(e: any) => setPseudonym(e?.target?.value)} />
        <TextArea label="Message" value={message} onChange={(e: any) => setMessage(e?.target?.value)} />
        <Button
          className="w-full"
          disabled={!wasm || disabled}
          loading={isLoadingWasm}
          onClick={onSubmit}
        >
          {getDisplayText()}
        </Button>
      </div>
    </Modal>
  );
}
