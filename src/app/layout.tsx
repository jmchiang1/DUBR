import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Shell } from "@/components/shell";
import { MessagesProvider } from "@/components/messages-store";
import { ProfileProvider } from "@/components/profile-store";
import { FollowProvider } from "@/components/follow-store";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

/* The display face. Loaded here rather than with an @font-face in base.css so that
   the URL of the .otf is written by the framework — a hard "/fonts/…" in a
   stylesheet is wrong the moment the app is served from a subpath, which on GitHub
   Pages it is. The single weight it ships covers the whole 400–900 range; see the
   note in tokens.css. */
const futura = localFont({
  src: "../../public/fonts/futura-heavy.otf",
  weight: "400 900",
  display: "swap",
  variable: "--font-futura",
});

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
    <html lang="en" className={`${inter.className} ${futura.variable}`}>
      <body>
        {/* The inbox is above the Shell because the rail's unread badge and the
            /messages page are two views of one state. */}
        {/* The profile is above the Shell for the same reason the inbox is: the
            rail's avatar and the /profile editor are two views of one state. */}
        {/* Who you follow sits up here too: the count on a player's page and the
            button beside it are two views of one state. */}
        <ProfileProvider>
          <FollowProvider>
            <MessagesProvider>
              <Shell>{children}</Shell>
            </MessagesProvider>
          </FollowProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
