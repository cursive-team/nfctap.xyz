import { TextArea } from "../ui/textarea";
import { useEffect, useState } from "react";
import { Sigmoji } from "@/lib/types";
import { loadSigmojis } from "@/lib/localStorage";
import { addZKPToSigmoji } from "@/lib/zkProving";
import { useWasm } from "@/hooks/useWasm";
import { useForm } from "react-hook-form";
import Modal from "../modals/Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

enum ChatDisplayState {
  LOADING,
  READY,
  PROVING,
  SUBMITTING,
}

interface FormProps {
  pseudonym: string;
  message: string;
}

export default function AnonChatModal() {
  const [displayState, setDisplayState] = useState<ChatDisplayState>(
    ChatDisplayState.LOADING
  );
  const [disabled, setDisabled] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormProps>();

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

  const onSubmit = async ({ pseudonym, message }: FormProps) => {
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
      setValue("message", "");
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center self-stretch text-center gap-4 p-2"
      >
        <Input
          {...register("pseudonym", {
            required: {
              value: true,
              message: "Please select a pseudonym.",
            },
          })}
          label="Pseudonym"
          error={errors?.pseudonym?.message}
        />
        <TextArea
          {...register("message", {
            required: {
              value: true,
              message: "Please enter a message.",
            },
          })}
          label="Message"
          error={errors?.message?.message}
        />
        <Button
          className="w-full mt-4"
          disabled={!wasm || disabled}
          loading={isLoadingWasm}
          type="submit"
        >
          {getDisplayText()}
        </Button>
      </form>
    </Modal>
  );
}
