import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shivani's Sparkle Streak",
  description: "A sweet pink tracker for habits, moods, notes, and daily wins",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
