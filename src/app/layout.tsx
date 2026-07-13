import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Shell } from "@/components/shell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "DUBR — Dynamic Universal Badminton Rating",
  description:
    "One rating that travels with you. Log a match, and every player's DUBR updates.",
};

export const viewport: Viewport = {
  themeColor: "#161616",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
