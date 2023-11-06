import "./globals.css";
import type { Metadata } from "next";
import { Courier_Prime } from "next/font/google";
import QueryClientWrapper from "@/components/shared/QueryClientWrapper";
import { Toaster } from "react-hot-toast";

const courier_prime = Courier_Prime({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-courier-prime",
  display: "swap",
});

export const metadata: Metadata = {
  title: "nfctap",
  description: "Starter application to build experiences with NFC and ZK",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${courier_prime.variable}`}>
        <QueryClientWrapper>{children}</QueryClientWrapper>
        <Toaster
          toastOptions={{
            duration: 5000,
          }}
        />
      </body>
    </html>
  );
}
