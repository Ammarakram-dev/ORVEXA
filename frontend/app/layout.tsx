import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORVEXA — Autonomous Action Intelligence",
  description:
    "ORVEXA transforms human intent into executable missions, actions and verified outcomes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
