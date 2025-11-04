import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
export const metadata = {
  title: "Unified Inbox",
  description: "Multi-channel messaging dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        
      >
        <Providers>{children}</Providers>
        
      </body>
    </html>
  );
}
