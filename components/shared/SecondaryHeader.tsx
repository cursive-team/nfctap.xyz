import Image from "next/image";

export const SecondaryHeader = ({ close }: { close: boolean }) => {
  return (
    <div className="flex justify-center my-10">
      <Image src="/logo.png" width="90" height="90" alt="Logo" />
      {close && (
        <div className="absolute top-5 right-5">
          <button className="text-2xl font-bold text-white">
            <Image src="/close.svg" width="24" height="24" alt="Close" />
          </button>
        </div>
      )}
    </div>
  );
};
