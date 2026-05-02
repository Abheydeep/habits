import type { Metadata, Viewport } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const iconPath = `${basePath}/icon.svg`;

export const metadata: Metadata = {
  title: "Shivani's Sparkle Streak",
  description: "A sweet pink tracker for habits, moods, notes, and daily wins",
  icons: {
    icon: iconPath,
    apple: iconPath
  }
};

export const viewport: Viewport = {
  themeColor: "#fff1f8"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
