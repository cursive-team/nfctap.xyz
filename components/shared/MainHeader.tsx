import Image from "next/image";

export const MainHeader = () => {
  return (
    <div className="flex justify-center mt-10">
      <Image src="/logo.png" width="90" height="90" alt="Logo" />
    </div>
  );
};
