import Image from "next/image";

const Footer = () => (
  <div className="flex flex-col py-8 flex-col justify-center gap-2 border-t border-t-woodsmoke-700 bg-woodsmoke-950">
    <div className="flex flex-col gap-4 items-center">
      <Image src="/pse-logo.svg" width="96" height="96" alt="PSE Logo" />
      <p className="text-snow-flurry-200">
        <a href="https://pse.dev" target="_blank">
          pse.dev
        </a>
      </p>
    </div>
  </div>
);

export default Footer;
