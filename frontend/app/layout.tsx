import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoleCall AI — Communication Simulation Platform",
  description: "Practice difficult conversations with realistic AI personas. Get coached on transcript, audio, and video interaction signals.",
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
