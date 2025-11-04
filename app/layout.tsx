import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Unified Inbox",
  description: "Multi-channel customer outreach dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning> {/* ✅ prevents harmless mismatches */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
