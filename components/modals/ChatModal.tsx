import Image from "next/image";
import { useEffect, useState } from "react";
import { Sigmoji } from "@/lib/types";
import { addZKPToSigmoji, setupTree } from "@/lib/zkProving";
import { useSigmojis } from "@/hooks/useSigmojis";
import { useWasm } from "@/hooks/useWasm";
import { Button } from "../ui/button";
import Modal from "./Modal";
import { Dropdown, DropdownProps } from "../ui/dropdown";
import { sha256 } from "js-sha256";
import { TextArea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

enum ChatDisplayState {
  LOADING,
  READY,
  PROVING,
  SUBMITTING,
}

interface FormProps {
  message: string;
  selectedSigmoji: string;
}

export default function ChatModal() {
  const { data: { wasm } = {}, isLoading: isLoadingWasm } = useWasm();
  const { data: sigmojis = [], isLoading: isLoadingSigmojis } = useSigmojis();
  const [isDisabled, setDisabled] = useState(false);

  const [displayState, setDisplayState] = useState<ChatDisplayState>(
    ChatDisplayState.READY
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormProps>();

  const selectedSigmoji = watch("selectedSigmoji", "");
  const isLoading = isLoadingWasm || isLoadingSigmojis;

  useEffect(() => {
    if (sigmojis?.length === 0) return;
    setValue("selectedSigmoji", sigmojis[0].emojiImg);
  }, [sigmojis]);

  const onSelectSigmoji = (emojiImg: string) => {
    setValue("selectedSigmoji", emojiImg);
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

  const onSubmit = async ({ message }: FormProps) => {
    setDisabled(true);

    let sigmoji = sigmojis.find(
      (sigmoji) => sigmoji.emojiImg === selectedSigmoji
    );

    if (!sigmoji) return;

    // enable manifestation
    let postedMessage = message;
    if (sigmoji.emojiImg === "magic-wand.png") {
      postedMessage = sha256(message);
    }

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
        message: postedMessage,
        sigmoji: sigmoji.emojiImg,
        serializedZKP: sigmoji.ZKP,
      }),
    }).then(async (response) => {
      setValue("message", "");
      setDisplayState(ChatDisplayState.READY);
      if (response.status === 200) {
        toast.success("Successfully sent chat message!");
      } else {
        const data = await response.json();
        if (data.error) {
          console.error(data.error);
        }
        toast.error("Error sending chat message.");
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

  const hasSimojis = sigmojis?.length > 0 && !isLoadingSigmojis;

  return (
    <Modal
      title="Collector Chat"
      description={
        <>
          <span>
            Chat as a collector of Sigmojis! Your message will be sent to the{" "}
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
        className="flex flex-col items-center self-stretch text-center gap-7 p-2 pb-0"
      >
        {selectedSigmoji && (
          <div className="flex flex-col gap-2 items-center">
            <Dropdown
              {...register("selectedSigmoji", {
                validate: (value) => {
                  console.log(
                    "s",
                    sigmojis.find((sigmoji) => sigmoji.emojiImg === value)
                  );
                  return sigmojis.find((sigmoji) => sigmoji.emojiImg === value)
                    ? ""
                    : "Invalid Sigmoji selected.";
                },
              })}
              label={
                <>
                  <span>Select Sigmoji to chat as:</span>
                  <Image
                    src={`/emoji-photo/${selectedSigmoji}`}
                    width="24"
                    height="24"
                    alt="emoji"
                  />
                  <Image
                    src="/buttons/chevron-down.svg"
                    width="24"
                    height="24"
                    alt="Chevron"
                    priority
                  />
                </>
              }
              items={sigmojisOptions}
            />
          </div>
        )}
        <TextArea
          label={
            selectedSigmoji === "magic-wand.png"
              ? "Hash Manifestation"
              : "Message"
          }
          error={errors?.message?.message}
          {...register("message", {
            required: {
              value: true,
              message: "Please enter a message.",
            },
          })}
        />
        <div className="flex flex-col gap-2 w-full">
          <Button
            className="w-full"
            disabled={!wasm || isLoading || isDisabled || !hasSimojis}
            loading={isLoading}
            type="submit"
          >
            {getDisplayText()}
          </Button>
          {errors?.selectedSigmoji?.message && (
            <span className="text-red-500 text-xs text-left">
              {errors?.selectedSigmoji?.message}
            </span>
          )}
        </div>
      </form>
    </Modal>
  );
}
