import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Shell } from "@/components/shell";
import { MessagesProvider } from "@/components/messages-store";
import { ProfileProvider } from "@/components/profile-store";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "DUBR — Dynamic Universal Badminton Rating",
  description:
    "One rating that travels with you. Log a match, and every player's DUBR updates.",
};

export const viewport: Viewport = {
  themeColor: "#22239d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        {/* The inbox is above the Shell because the rail's unread badge and the
            /messages page are two views of one state. */}
        {/* The profile is above the Shell for the same reason the inbox is: the
            rail's avatar and the /profile editor are two views of one state. */}
        <ProfileProvider>
          <MessagesProvider>
            <Shell>{children}</Shell>
          </MessagesProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
