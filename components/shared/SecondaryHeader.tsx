import Image from "next/image";

export const SecondaryHeader = ({ close }: { close: boolean }) => {
  return (
    <div className="flex justify-center mt-10">
      <Image src="/logo.png" width="90" height="90" alt="Logo" />
      {close && (
        <div className="absolute top-5 right-5">
          <button className="text-2xl font-bold text-white">X</button>
        </div>
      )}
    </div>
  );
};
